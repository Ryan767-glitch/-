import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI, Modality, type Session } from "@google/genai";
import { useAppStore } from "../store/useAppStore";

const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;

export default function LivePage() {
  const navigate = useNavigate();
  const addIncident = useAppStore((s) => s.addIncident);

  const [status, setStatus] = useState<
    "idle" | "connecting" | "active" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [transcript, setTranscript] = useState<string[]>([]);

  const sessionRef = useRef<Session | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);

  // Convert Float32Array ([-1,1]) to 16-bit PCM base64
  const float32ToBase64Pcm = useCallback((float32: Float32Array): string => {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  // Decode base64 PCM (16-bit, 24kHz output from Gemini) and play
  const playAudio = useCallback((base64: string) => {
    if (!playbackCtxRef.current) {
      playbackCtxRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const ctx = playbackCtxRef.current;

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 0x8000;
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }, []);

  // Start a live session
  const startSession = useCallback(async () => {
    setStatus("connecting");
    setErrorMsg("");
    setTranscript([]);

    try {
      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });

      // Get mic stream first
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const audioCtx = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioCtxRef.current = audioCtx;

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction:
            "あなたは高齢者を詐欺から守る優しいアシスタントです。名前は「あんしんガード」です。ゆっくり、短く、ひらがなを多用して話してください。お金や個人情報の話が出たら絶対に止めてください。「それは詐欺の可能性があります。家族に相談してください」と必ず伝えてください。",
        },
        callbacks: {
          onopen: () => {
            setStatus("active");
            setTranscript((prev) => [
              ...prev,
              "🟢 接続しました。話しかけてください。",
            ]);

            // Start sending mic audio
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(
              BUFFER_SIZE,
              1,
              1,
            );
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const base64 = float32ToBase64Pcm(inputData);
              sessionRef.current?.sendRealtimeInput({
                media: {
                  mimeType: "audio/pcm;rate=16000",
                  data: base64,
                },
              });
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);
          },
          onmessage: (message) => {
            // Handle audio response
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  playAudio(part.inlineData.data);
                }
                if (part.text) {
                  setTranscript((prev) => [...prev, `🤖 ${part.text}`]);
                  // Check for danger keywords in text responses
                  const dangerKeywords = [
                    "詐欺",
                    "危険",
                    "振り込",
                    "個人情報",
                  ];
                  if (
                    dangerKeywords.some((kw) => part.text?.includes(kw))
                  ) {
                    addIncident({
                      type: "voice",
                      riskLevel: "caution",
                      summary: "音声相談で注意喚起",
                      detail: part.text?.slice(0, 200) ?? "",
                    });
                  }
                }
              }
            }

            // Handle turn completion
            if (message.serverContent?.turnComplete) {
              setTranscript((prev) => [...prev, "---"]);
            }
          },
          onerror: (e) => {
            console.error("Live API error:", e);
            setErrorMsg(
              e instanceof Error ? e.message : "接続エラーが発生しました",
            );
            setStatus("error");
          },
          onclose: () => {
            setTranscript((prev) => [...prev, "🔴 接続が終了しました。"]);
            setStatus("idle");
          },
        },
      });

      sessionRef.current = session;
    } catch (e) {
      console.error(e);
      setErrorMsg(
        e instanceof Error ? e.message : "接続できませんでした",
      );
      setStatus("error");
    }
  }, [addIncident, float32ToBase64Pcm, playAudio]);

  // Stop the session
  const stopSession = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;

    playbackCtxRef.current?.close();
    playbackCtxRef.current = null;

    sessionRef.current?.close();
    sessionRef.current = null;

    setStatus("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      processorRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      playbackCtxRef.current?.close();
      sessionRef.current?.close();
    };
  }, []);

  const isActive = status === "active";
  const isConnecting = status === "connecting";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-senior-bg flex flex-col items-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <button
          onClick={() => {
            stopSession();
            navigate("/senior");
          }}
          className="text-xl font-bold text-primary"
        >
          ← もどる
        </button>

        <h2 className="text-3xl font-extrabold text-center">
          🎙️ AI音声そうだん
        </h2>

        <p className="text-xl text-center text-gray-600">
          ボタンをおして
          <br />
          なんでもはなしてください
        </p>

        {/* Mic button */}
        <div className="flex justify-center">
          {!isActive ? (
            <button
              onClick={startSession}
              disabled={isConnecting}
              className="w-40 h-40 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white flex flex-col items-center justify-center shadow-2xl transition-transform active:scale-95"
            >
              {isConnecting ? (
                <>
                  <span className="text-5xl animate-pulse">📡</span>
                  <span className="text-lg font-bold mt-2">
                    せつぞくちゅう
                  </span>
                </>
              ) : (
                <>
                  <span className="text-5xl">🎙️</span>
                  <span className="text-lg font-bold mt-2">はなす</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="w-40 h-40 rounded-full bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center shadow-2xl animate-pulse transition-transform active:scale-95"
            >
              <span className="text-5xl">⏹️</span>
              <span className="text-lg font-bold mt-2">とめる</span>
            </button>
          )}
        </div>

        {isActive && (
          <p className="text-center text-lg text-purple-700 font-bold animate-pulse">
            🔴 はなしています...
          </p>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-red-700 text-lg text-center">
            {errorMsg}
          </div>
        )}

        {/* Transcript log */}
        {transcript.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 max-h-64 overflow-y-auto space-y-2">
            <p className="text-sm font-bold text-gray-500 mb-2">
              かいわログ
            </p>
            {transcript.map((line, i) => (
              <p key={i} className="text-base text-gray-700">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

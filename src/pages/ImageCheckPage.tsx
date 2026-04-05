import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeImage } from "../lib/gemini";
import { useAppStore, type RiskLevel } from "../store/useAppStore";
import ResultCard from "../components/ResultCard";

export default function ImageCheckPage() {
  const navigate = useNavigate();
  const addIncident = useAppStore((s) => s.addIncident);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    riskLevel: RiskLevel;
    reason: string;
    advice: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!preview) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const [header, base64] = preview.split(",");
      const mimeType = header.match(/:(.*?);/)?.[1] ?? "image/png";
      const res = await analyzeImage(base64, mimeType);
      setResult(res);
      addIncident({
        type: "image",
        riskLevel: res.riskLevel,
        summary: "画像判定",
        detail: res.reason,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-senior-bg flex flex-col items-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <button
          onClick={() => navigate("/senior")}
          className="text-xl font-bold text-primary"
        >
          ← もどる
        </button>

        <h2 className="text-3xl font-extrabold text-center">📷 画像判定</h2>

        <p className="text-xl text-center text-gray-600">
          あやしい写真やスクリーンショットを
          <br />
          えらんでください
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-extrabold py-5 rounded-2xl shadow-lg transition-transform active:scale-95"
        >
          📷 しゃしんをえらぶ
        </button>

        {preview && (
          <img
            src={preview}
            alt="プレビュー"
            className="w-full rounded-2xl border-2 border-gray-300 object-contain max-h-80"
          />
        )}

        {preview && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-2xl font-extrabold py-5 rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            {loading ? (
              <span className="inline-flex items-center gap-3">
                <span className="animate-spin text-3xl">⏳</span>
                しらべています...
              </span>
            ) : (
              "しらべる"
            )}
          </button>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-red-700 text-lg text-center">
            {error}
          </div>
        )}

        {result && <ResultCard {...result} />}
      </div>
    </div>
  );
}

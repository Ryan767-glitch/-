import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeSms } from "../lib/gemini";
import { useAppStore, type RiskLevel } from "../store/useAppStore";
import ResultCard from "../components/ResultCard";

export default function SmsCheckPage() {
  const navigate = useNavigate();
  const addIncident = useAppStore((s) => s.addIncident);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    riskLevel: RiskLevel;
    reason: string;
    advice: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await analyzeSms(text);
      setResult(res);
      addIncident({
        type: "sms",
        riskLevel: res.riskLevel,
        summary: text.slice(0, 60),
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

        <h2 className="text-3xl font-extrabold text-center">📩 SMS判定</h2>

        <p className="text-xl text-center text-gray-600">
          あやしいメッセージを
          <br />
          はりつけてください
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="ここにメッセージをはりつけ..."
          className="w-full text-xl p-4 rounded-2xl border-2 border-gray-300 focus:border-primary focus:outline-none resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
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

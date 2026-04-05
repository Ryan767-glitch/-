import type { RiskLevel } from "../store/useAppStore";

const config: Record<
  RiskLevel,
  { bg: string; border: string; icon: string; label: string }
> = {
  safe: {
    bg: "bg-green-50",
    border: "border-safe",
    icon: "✅",
    label: "あんぜんです",
  },
  caution: {
    bg: "bg-yellow-50",
    border: "border-caution",
    icon: "⚠️",
    label: "ちゅうい！",
  },
  danger: {
    bg: "bg-red-50",
    border: "border-danger",
    icon: "🚨",
    label: "きけん！ぜったいダメ！",
  },
};

interface Props {
  riskLevel: RiskLevel;
  reason: string;
  advice: string;
}

export default function ResultCard({ riskLevel, reason, advice }: Props) {
  const c = config[riskLevel];
  return (
    <div
      className={`${c.bg} border-4 ${c.border} rounded-2xl p-6 space-y-4 animate-fade-in`}
    >
      <div className="text-center">
        <span className="text-6xl">{c.icon}</span>
        <p className="text-3xl font-extrabold mt-2">{c.label}</p>
      </div>
      <div className="text-xl leading-relaxed space-y-3">
        <p>
          <span className="font-bold">りゆう：</span>
          {reason}
        </p>
        <p>
          <span className="font-bold">アドバイス：</span>
          {advice}
        </p>
      </div>
    </div>
  );
}

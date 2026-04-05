interface Props {
  score: number;
}

export default function SafetyScore({ score }: Props) {
  const color =
    score >= 80
      ? "text-safe"
      : score >= 50
        ? "text-caution"
        : "text-danger";

  const ringColor =
    score >= 80
      ? "stroke-safe"
      : score >= 50
        ? "stroke-caution"
        : "stroke-danger";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" className="-rotate-90">
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          className={ringColor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center w-[140px] h-[140px]">
        <span className={`text-4xl font-extrabold ${color}`}>{score}</span>
        <span className="text-xs text-gray-500 font-semibold">/ 100</span>
      </div>
    </div>
  );
}

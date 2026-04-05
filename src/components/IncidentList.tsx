import type { Incident } from "../store/useAppStore";

const riskBadge: Record<string, string> = {
  safe: "bg-safe-light text-green-900",
  caution: "bg-caution-light text-yellow-900",
  danger: "bg-danger-light text-red-900",
};

const typeLabel: Record<string, string> = {
  sms: "SMS判定",
  image: "画像判定",
  voice: "音声相談",
};

interface Props {
  incidents: Incident[];
}

export default function IncidentList({ incidents }: Props) {
  if (incidents.length === 0) {
    return (
      <p className="text-gray-400 text-center py-8">
        インシデントはまだありません
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 shadow-sm"
        >
          <div className="flex flex-col items-center gap-1 min-w-[72px]">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskBadge[inc.riskLevel]}`}
            >
              {inc.riskLevel.toUpperCase()}
            </span>
            <span className="text-[11px] text-gray-400">
              {typeLabel[inc.type]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {inc.summary}
            </p>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {inc.detail}
            </p>
          </div>
          <time className="text-xs text-gray-400 whitespace-nowrap">
            {new Date(inc.timestamp).toLocaleString("ja-JP")}
          </time>
        </div>
      ))}
    </div>
  );
}

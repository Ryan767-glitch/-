import { useAppStore } from "../store/useAppStore";
import SafetyScore from "../components/SafetyScore";
import IncidentList from "../components/IncidentList";

export default function FamilyPage() {
  const { safetyScore, incidents, resetScore } = useAppStore();

  const dangerCount = incidents.filter(
    (i) => i.riskLevel === "danger",
  ).length;
  const cautionCount = incidents.filter(
    (i) => i.riskLevel === "caution",
  ).length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800">
          家族ダッシュボード
        </h2>
        <p className="text-gray-500 mt-1">
          お親の安全状況をリアルタイムで確認できます
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Safety score card */}
        <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center relative">
          <p className="text-sm font-semibold text-gray-500 mb-3">
            安全スコア
          </p>
          <SafetyScore score={safetyScore} />
        </div>

        {/* Stat cards */}
        <StatCard
          label="総インシデント"
          value={incidents.length}
          color="text-primary"
          bg="bg-blue-50"
        />
        <StatCard
          label="危険判定"
          value={dangerCount}
          color="text-danger"
          bg="bg-red-50"
        />
        <StatCard
          label="注意判定"
          value={cautionCount}
          color="text-caution"
          bg="bg-yellow-50"
        />
      </div>

      {/* Incident list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            インシデント履歴
          </h3>
          {incidents.length > 0 && (
            <button
              onClick={resetScore}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              リセット
            </button>
          )}
        </div>
        <IncidentList incidents={incidents} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`${bg} rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center`}
    >
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className={`text-4xl font-extrabold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

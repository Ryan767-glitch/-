import { useNavigate } from "react-router-dom";

const buttons = [
  {
    label: "SMS判定",
    sub: "あやしいメッセージを\nしらべる",
    icon: "📩",
    path: "/senior/sms",
    color: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
  },
  {
    label: "画像判定",
    sub: "あやしい写真や画面を\nしらべる",
    icon: "📷",
    path: "/senior/image",
    color: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800",
  },
  {
    label: "AI音声相談",
    sub: "AIとはなして\nそうだんする",
    icon: "🎙️",
    path: "/live",
    color: "bg-purple-600 hover:bg-purple-700 active:bg-purple-800",
  },
] as const;

export default function SeniorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-senior-bg flex flex-col items-center justify-center p-6 gap-8">
      <h2 className="text-3xl font-extrabold text-gray-800 text-center leading-snug">
        こまったときは
        <br />
        ボタンをおしてね
      </h2>

      <div className="w-full max-w-md space-y-6">
        {buttons.map((btn) => (
          <button
            key={btn.path}
            onClick={() => navigate(btn.path)}
            className={`${btn.color} w-full text-white rounded-3xl p-8 flex items-center gap-6 shadow-lg transition-transform active:scale-95`}
          >
            <span className="text-6xl">{btn.icon}</span>
            <div className="text-left">
              <p className="text-3xl font-extrabold">{btn.label}</p>
              <p className="text-lg mt-1 whitespace-pre-line opacity-90">
                {btn.sub}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

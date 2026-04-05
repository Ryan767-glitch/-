import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-lg font-bold transition-colors ${
    isActive
      ? "bg-primary text-white"
      : "text-gray-600 hover:bg-gray-100"
  }`;

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-primary tracking-tight">
            🛡️ 親あんしんガード
          </h1>
          <nav className="flex gap-2">
            <NavLink to="/senior" className={linkClass}>
              シニア
            </NavLink>
            <NavLink to="/family" className={linkClass}>
              家族
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

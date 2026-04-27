import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-8 ml-64">
      
      {/* LEFT: Welcome */}
      <div>
        <h1 className="text-lg font-semibold">
          Welcome back, {user?.name || "User"} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Here's what's happening today
        </p>
      </div>

      {/* RIGHT: Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </header>
  );
};

export default Header;
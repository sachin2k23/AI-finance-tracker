import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Bills", path: "/bills" },
    { name: "Transactions", path: "/transactions" },
    { name: "Analytics", path: "/analytics" },
    { name: "Goals", path: "/goals" },
  ];

  return (
    <aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 flex flex-col justify-between">
      
      {/* TOP SECTION */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="bg-blue-600 text-white font-bold rounded-lg w-9 h-9 flex items-center justify-center">
            FT
          </div>
          <span className="text-lg font-semibold">FinanceTracker</span>
        </div>

        {/* Menu */}
        <nav className="flex flex-col p-4 gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* BOTTOM SECTION */}
      <div className="p-4 border-t">
        <button className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100">
          ⚙️ Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
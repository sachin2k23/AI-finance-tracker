const StatCard = ({ title, value, change, isPositive, icon, color }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border flex justify-between items-center">
      
      {/* LEFT CONTENT */}
      <div>
        <p className="text-sm text-gray-500">{title}</p>

        <h2 className="text-2xl font-semibold mt-1">{value}</h2>

        <p
          className={`text-sm mt-1 ${
            isPositive ? "text-green-600" : "text-red-500"
          }`}
        >
          {change}
        </p>
      </div>

      {/* RIGHT ICON */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
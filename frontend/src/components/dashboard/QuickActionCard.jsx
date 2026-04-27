const QuickActionCard = ({ title, description, icon, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-xl shadow-sm border cursor-pointer 
                 hover:shadow-md transition flex items-start gap-4"
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
      >
        {icon}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default QuickActionCard;
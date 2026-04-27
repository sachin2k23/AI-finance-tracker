const insights = [
  {
    type: "positive",
    message: "Your profit increased by 8% compared to last week.",
  },
  {
    type: "warning",
    message: "Expenses are rising faster than income this month.",
  },
  {
    type: "suggestion",
    message: "Consider reducing food expenses to save more.",
  },
];

const getStyle = (type) => {
  switch (type) {
    case "positive":
      return "bg-green-50 text-green-700";
    case "warning":
      return "bg-yellow-50 text-yellow-700";
    case "suggestion":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const getIcon = (type) => {
  switch (type) {
    case "positive":
      return "📈";
    case "warning":
      return "⚠️";
    case "suggestion":
      return "💡";
    default:
      return "ℹ️";
  }
};

const AIInsights = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          AI Insights
        </h3>
        <p className="text-sm text-gray-500">
          Smart suggestions based on your data
        </p>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg flex items-start gap-3 ${getStyle(
              item.type
            )}`}
          >
            <span className="text-lg">
              {getIcon(item.type)}
            </span>

            <p className="text-sm">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
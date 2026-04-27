import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { day: "Sun", sales: 0, expenses: 0, profit: 0 },
  { day: "Mon", sales: 0, expenses: 0, profit: 0 },
  { day: "Tue", sales: 0, expenses: 0, profit: 0 },
  { day: "Wed", sales: 0, expenses: 0, profit: 0 },
  { day: "Thu", sales: 0, expenses: 0, profit: 0 },
  { day: "Fri", sales: 0, expenses: 0, profit: 0 },
  { day: "Sat", sales: 0, expenses: 0, profit: 0 },
];

const CashFlowChart = ({ data }) => {
  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Weekly Cash Flow</h3>
        <p className="text-sm text-gray-500">Sales vs Expenses vs Profit</p>
      </div>

      {/* Chart - NO ResponsiveContainer, fixed width/height */}
      <LineChart
        width={600}
        height={280}
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} />
        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
        <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>

    </div>
  );
};

export default CashFlowChart;
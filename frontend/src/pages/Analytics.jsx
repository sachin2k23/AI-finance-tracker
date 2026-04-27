import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import api from "../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"];

const Analytics = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= KPI =================
  const totalSales = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const totalInvestments = transactions
    .filter((t) => t.type === "investment")
    .reduce((a, b) => a + b.amount, 0);

  const profit = totalSales - totalExpenses;

  // ================= CHART DATA =================
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const chartData = days.map((day) => ({
    day,
    sales: 0,
    expenses: 0,
    profit: 0,
  }));

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const dayIndex = d.getDay();

    if (t.type === "income") {
      chartData[dayIndex].sales += t.amount;
    }

    if (t.type === "expense") {
      chartData[dayIndex].expenses += t.amount;
    }

    chartData[dayIndex].profit =
      chartData[dayIndex].sales - chartData[dayIndex].expenses;
  });

  // ================= PIE DATA =================
  const categoryMap = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += t.amount;
    });

  const pieData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  // ================= EXPORT =================
  const exportCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Description"];

    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.amount,
      t.description || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <MainLayout>
      <div className="p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>

          <button
            onClick={exportCSV}
            className="border px-4 py-2 rounded-lg"
          >
            ⬇ Export
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card title="Monthly Sales" value={totalSales} color="text-green-600" />
          <Card title="Monthly Expenses" value={totalExpenses} color="text-red-500" />
          <Card title="Monthly Profit" value={profit} color="text-blue-600" />
          <Card title="Monthly Investments" value={totalInvestments} color="text-purple-600" />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-2 gap-6">

          {/* BAR + LINE CHART */}
          <div className="bg-white p-6 rounded-xl shadow h-[350px]">
            <h2 className="font-semibold mb-4">Monthly Overview</h2>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `Rs.${value.toLocaleString()}`}
                />
                <Legend />

                <Bar
                  dataKey="sales"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="0"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="bg-white p-6 rounded-xl shadow h-[350px]">
            <h2 className="font-semibold mb-4">Expense Categories</h2>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default Analytics;


// ================= CARD COMPONENT =================
const Card = ({ title, value, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className={`text-2xl font-bold ${color}`}>
        ₹{value}
      </h2>
    </div>
  );
};

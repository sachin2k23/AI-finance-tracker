import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";
import MainLayout from "../layout/MainLayout";

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, change, isPositive, icon, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border flex justify-between items-center">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-semibold mt-1">{value}</h2>
      <p className={`text-sm mt-1 ${isPositive ? "text-green-600" : "text-red-500"}`}>
        {change}
      </p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
  </div>
);

// ─── QuickActionCard ──────────────────────────────────────────────────────────
const QuickActionCard = ({ title, description, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition flex items-start gap-4"
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  </div>
);

// ─── TransactionsTable ────────────────────────────────────────────────────────
const TransactionsTable = ({ transactions }) => (
  <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
    <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-gray-500">
          <tr>
            <th className="py-2">Date</th>
            <th className="py-2">Type</th>
            <th className="py-2">Category</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-6 text-center text-gray-400">
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t._id} className="border-b hover:bg-gray-50">
                <td className="py-2">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                <td className="py-2 capitalize">{t.type}</td>
                <td className="py-2">{t.category}</td>
                <td className={`py-2 font-medium ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                </td>
                <td className="py-2 text-gray-500">{t.description || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── CashFlowChart ────────────────────────────────────────────────────────────
const CashFlowChart = ({ data }) => (
  <div className="w-full">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">Weekly Cash Flow</h3>
      <p className="text-sm text-gray-500">Sales vs Expenses vs Profit</p>
    </div>
    {/* ✅ ResponsiveContainer — fills the card on all screen sizes */}
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} />
        <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }}
          formatter={(v) => `₹${v.toLocaleString("en-IN")}`}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
        <Line type="monotone" dataKey="sales"    stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="profit"   stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ─── AIInsights ───────────────────────────────────────────────────────────────
const getStyle = (type) => {
  switch (type) {
    case "positive":   return "bg-green-50 text-green-700";
    case "warning":    return "bg-yellow-50 text-yellow-700";
    case "suggestion": return "bg-blue-50 text-blue-700";
    default:           return "bg-gray-50 text-gray-700";
  }
};
const getIcon = (type) => {
  switch (type) {
    case "positive":   return "📈";
    case "warning":    return "⚠️";
    case "suggestion": return "💡";
    default:           return "ℹ️";
  }
};

const AIInsights = ({ transactions }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const generateInsights = useCallback(async () => {
    if (!transactions || transactions.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      // ✅ FIXED: Call our own backend — Anthropic API cannot be called from browser (CORS)
      const res = await api.post("/ai/insights", { transactions });
      setInsights(res.data.insights || []);
    } catch (err) {
      console.error("AI Insights error:", err);
      setError("Could not load AI insights.");
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  // Auto-run whenever transactions change
  useEffect(() => {
    if (transactions?.length > 0) generateInsights();
  }, [transactions?.length]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Insights</h3>
          <p className="text-sm text-gray-500">Real analysis of your data</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="text-xs text-blue-600 hover:underline disabled:opacity-40"
        >
          {loading ? "Thinking..." : "↺ Refresh"}
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
          ))
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : insights.length === 0 ? (
          <p className="text-sm text-gray-400">Add transactions to get AI insights.</p>
        ) : (
          insights.map((item, i) => (
            <div key={i} className={`p-3 rounded-lg flex items-start gap-3 ${getStyle(item.type)}`}>
              <span className="text-lg">{getIcon(item.type)}</span>
              <p className="text-sm">{item.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get("/transactions")
      .then((res) => {
        setTransactions(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);
        setIsLoading(false);
      });
  }, []);

  // Chart data
  const chartData = (() => {
    const days   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = days.map((day) => ({ day, sales: 0, expenses: 0, profit: 0 }));
    transactions.forEach((t) => {
      const idx = new Date(t.date).getDay();
      if (t.type === "income")  result[idx].sales    += t.amount;
      if (t.type === "expense") result[idx].expenses += t.amount;
    });
    result.forEach((d) => { d.profit = d.sales - d.expenses; });
    return result;
  })();

  // Today / yesterday helpers
  const todayStr     = new Date().toDateString();
  const yesterdayStr = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toDateString(); })();
  const todayTx      = transactions.filter((t) => new Date(t.date).toDateString() === todayStr);
  const yesterdayTx  = transactions.filter((t) => new Date(t.date).toDateString() === yesterdayStr);
  const sumType      = (arr, type) => arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

  const todayIncome     = sumType(todayTx, "income");
  const todayExpenses   = sumType(todayTx, "expense");
  const todayProfit     = todayIncome - todayExpenses;
  const todayInvestment = sumType(todayTx, "investment");
  const yestInvestment  = sumType(yesterdayTx, "investment");

  const investmentChange =
    yestInvestment === 0
      ? todayInvestment > 0 ? "New today" : "No investment today"
      : `${todayInvestment >= yestInvestment ? "+" : ""}${(((todayInvestment - yestInvestment) / yestInvestment) * 100).toFixed(1)}% vs yesterday`;

  return (
    <MainLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-gray-500 text-sm">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stat Cards - Show skeleton while loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // ✅ Skeleton loaders while data is loading
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-20"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard title="Today's Sales"      value={`₹${todayIncome.toLocaleString("en-IN")}`}     change="Live data"        isPositive={true}                              icon={<span>💰</span>} color="bg-green-100 text-green-600"   />
            <StatCard title="Today's Expenses"   value={`₹${todayExpenses.toLocaleString("en-IN")}`}   change="Live data"        isPositive={false}                             icon={<span>📉</span>} color="bg-red-100 text-red-500"       />
            <StatCard title="Today's Profit"     value={`₹${todayProfit.toLocaleString("en-IN")}`}     change="Live data"        isPositive={todayProfit >= 0}                  icon={<span>📈</span>} color="bg-blue-100 text-blue-600"     />
            <StatCard title="Today's Investment" value={`₹${todayInvestment.toLocaleString("en-IN")}`} change={investmentChange} isPositive={todayInvestment >= yestInvestment} icon={<span>🎯</span>} color="bg-purple-100 text-purple-600"  />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard title="Upload Bill" description="Upload and extract bill data" icon={<span>📤</span>} color="bg-blue-100 text-blue-600"   onClick={() => navigate("/bills")}        />
          <QuickActionCard title="Add Expense" description="Quick expense entry"          icon={<span>💸</span>} color="bg-red-100 text-red-500"     onClick={() => navigate("/transactions")} />
          <QuickActionCard title="Set Goal"    description="Define financial goals"       icon={<span>🎯</span>} color="bg-green-100 text-green-600" onClick={() => navigate("/goals")}        />
        </div>
      </div>

      {/* Chart + AI Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
          {isLoading ? (
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          ) : (
            <CashFlowChart data={chartData} />
          )}
        </div>
        <AIInsights transactions={transactions} />
      </div>

      {/* Recent Transactions */}
      {isLoading ? (
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <TransactionsTable transactions={transactions.slice(0, 5)} />
          <button onClick={() => navigate("/transactions")} className="mt-4 text-blue-600 hover:underline">
            View All Transactions →
          </button>
        </>
      )}
    </MainLayout>
  );
};

export default Dashboard;
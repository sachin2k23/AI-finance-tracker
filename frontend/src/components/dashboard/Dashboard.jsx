import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import QuickActionCard from "./QuickActionCard";
import StatCard from "./StatCard";
import CashFlowChart from "./CashFlowChart";
import AIInsights from "./AIInsights";
import TransactionsTable from "./TransactionsTable";
import api from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/transactions");
        setTransactions(res.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  const formatChartData = (transactions) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const result = days.map((day) => ({
      day,
      sales: 0,
      expenses: 0,
      profit: 0,
    }));

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const dayIndex = date.getDay();

      if (t.type === "income") {
        result[dayIndex].sales += t.amount;
      } else {
        result[dayIndex].expenses += t.amount;
      }
    });

    // calculate profit
    result.forEach((d) => {
      d.profit = d.sales - d.expenses;
    });

    return result;
  };

  const chartData = formatChartData(transactions);

  // Calculate totals
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalProfit = totalIncome - totalExpenses;

  // Calculate today's data
  const today = new Date().toDateString();

  const todayTransactions = transactions.filter(
    (t) => new Date(t.date).toDateString() === today
  );

  const todayExpenses = todayTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayIncome = todayTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const todayProfit = todayIncome - todayExpenses;

  return (
    <MainLayout>
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-gray-500 text-sm">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <StatCard
          title="Today's Sales"
          value={`₹${todayIncome}`}
          change="Live data"
          isPositive={true}
          icon={<span>💰</span>}
          color="bg-green-100 text-green-600"
        />

        <StatCard
          title="Today's Expenses"
          value={`₹${todayExpenses}`}
          change="Live data"
          isPositive={false}
          icon={<span>📉</span>}
          color="bg-red-100 text-red-500"
        />

        <StatCard
          title="Today's Profit"
          value={`₹${todayProfit}`}
          change="Live data"
          isPositive={todayProfit >= 0}
          icon={<span>📈</span>}
          color="bg-blue-100 text-blue-600"
        />

        <StatCard
          title="Today's Investment"
          value="₹0"
          change="+0% vs yesterday"
          isPositive={true}
          icon={<span>🎯</span>}
          color="bg-purple-100 text-purple-600"
        />

      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Upload Bill"
            description="Upload and extract bill data"
            icon={<span>📤</span>}
            color="bg-blue-100 text-blue-600"
            onClick={() => console.log("Upload Bill")}
          />

          <QuickActionCard
            title="Add Expense"
            description="Quick expense entry"
            icon={<span>💸</span>}
            color="bg-red-100 text-red-500"
            onClick={() => console.log("Add Expense")}
          />

          <QuickActionCard
            title="Set Goal"
            description="Define financial goals"
            icon={<span>🎯</span>}
            color="bg-green-100 text-green-600"
            onClick={() => console.log("Set Goal")}
          />
        </div>
      </div>

      {/* Chart + AI Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart takes 2 columns - removed h-[350px] */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
          <CashFlowChart data={chartData} />
        </div>

        {/* AI Insights */}
        <AIInsights />

      </div>

      {/* Transactions Table */}
      <TransactionsTable transactions={transactions.slice(0, 5)} />
      
      <button
        onClick={() => navigate("/transactions")}
        className="mt-4 text-blue-600 hover:underline"
      >
        View All Transactions →
      </button>

    </MainLayout>
  );
};

export default Dashboard;
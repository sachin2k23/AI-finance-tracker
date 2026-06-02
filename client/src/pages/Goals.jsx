import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import api from "../services/api";

const initialForm = {
  title: "",
  type: "saving",
  targetAmount: "",
  currentAmount: "",
  deadline: "",
};

// ─── Goals (main) ─────────────────────────────────────────────────────────────
const Goals = () => {
  const [goals, setGoals]               = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm]                 = useState(initialForm);
  const [progressInputs, setProgressInputs] = useState({});
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => { fetchGoals(); }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const [goalsRes, txRes] = await Promise.all([
        api.get("/goals"),
        api.get("/transactions"),
      ]);
      setGoals(goalsRes.data);
      setTransactions(txRes.data);
      setProgressInputs(
        goalsRes.data.reduce((acc, g) => { acc[g._id] = g.currentAmount; return acc; }, {})
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/goals", {
        ...form,
        targetAmount:  Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
      });
      setGoals((prev) => [res.data, ...prev]);
      setProgressInputs((prev) => ({ ...prev, [res.data._id]: res.data.currentAmount ?? 0 }));
      setForm(initialForm);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (goal) => {
    try {
      await api.put(`/goals/${goal._id}`, {
        currentAmount: Number(progressInputs[goal._id] ?? goal.currentAmount),
      });
      fetchGoals();
    } catch (err) { console.error(err); }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) { console.error(err); }
  };

  // ── Progress calculation ──────────────────────────────────────
  const calculateGoalProgress = (goal) => {
    if (goal.type === "saving") {
      const income  = transactions.filter((t) => t.type === "income") .reduce((s, t) => s + t.amount, 0);
      const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      const current = income - expense;
      const pct     = (current / goal.targetAmount) * 100;
      return { currentAmount: current, percentage: pct, status: pct >= 100 ? "achieved" : pct < 50 ? "at-risk" : "on-track" };
    }
    const relevant = goal.type === "income"
      ? transactions.filter((t) => t.type === "income")
      : goal.type === "expense"
      ? transactions.filter((t) => t.type === "expense")
      : transactions;
    const current = relevant.reduce((s, t) => s + t.amount, 0);
    const pct     = (current / goal.targetAmount) * 100;
    return { currentAmount: current, percentage: pct, status: pct >= 100 ? "achieved" : pct < 50 ? "at-risk" : "on-track" };
  };

  const today = new Date();
  const goalsWithProgress = goals.map((g) => ({ ...g, progress: calculateGoalProgress(g) }));
  const achievedGoals = goalsWithProgress.filter((g) => g.progress.percentage >= 100);
  const atRiskGoals   = goalsWithProgress.filter((g) => {
    const daysLeft  = (new Date(g.deadline) - today) / (1000 * 60 * 60 * 24);
    return g.progress.percentage < 100 && daysLeft <= 14;
  });
  const activeGoals = goalsWithProgress.filter((g) => g.progress.percentage < 100);

  return (
    <MainLayout>
      <div className="min-h-full space-y-6 bg-slate-50 p-8">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Goals & Targets</h1>
            <p className="mt-2 text-sm text-gray-500">
              Track savings progress and keep an eye on what needs attention.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <span className="mr-2 text-lg leading-none">+</span> Set New Goal
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          <SummaryCard title="Active Goals"  value={activeGoals.length}   icon="🎯" iconClasses="bg-blue-50 text-blue-600"     />
          <SummaryCard title="Achieved"      value={achievedGoals.length} icon="✅" iconClasses="bg-emerald-50 text-emerald-500" />
          <SummaryCard title="At Risk"       value={atRiskGoals.length}   icon="⚠️" iconClasses="bg-rose-50 text-rose-500"       />
        </div>

        {/* Active Goals */}
        <section>
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Active Goals</h2>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-slate-500 shadow-sm">
              Loading goals...
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-300 text-2xl text-slate-400">
                🎯
              </div>
              <p className="mb-3 text-sm text-gray-500">No active goals set</p>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                + Set Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-2">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  progressValue={progressInputs[goal._id] ?? goal.progress.currentAmount}
                  onProgressChange={(v) => setProgressInputs({ ...progressInputs, [goal._id]: v })}
                  onUpdate={() => handleUpdateProgress(goal)}
                  onDelete={() => handleDeleteGoal(goal._id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Achieved Goals */}
        {achievedGoals.length > 0 && (
          <section>
            <h2 className="mb-6 text-lg font-semibold text-slate-900">🏆 Achieved Goals</h2>
            <div className="grid gap-6 xl:grid-cols-2">
              {achievedGoals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  progressValue={progressInputs[goal._id] ?? goal.progress.currentAmount}
                  onProgressChange={(v) => setProgressInputs({ ...progressInputs, [goal._id]: v })}
                  onUpdate={() => handleUpdateProgress(goal)}
                  onDelete={() => handleDeleteGoal(goal._id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Create Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Set New Goal</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Create a savings target and track progress automatically.
                  </p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setForm(initialForm); }}
                  className="text-xl text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="grid gap-4 md:grid-cols-2">
                <input
                  type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="Goal title"
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
                <select
                  name="type" value={form.type} onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="saving">Saving</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input
                  type="number" name="targetAmount" value={form.targetAmount} onChange={handleChange}
                  placeholder="Target amount (₹)"
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  required min="1"
                />
                <input
                  type="number" name="currentAmount" value={form.currentAmount} onChange={handleChange}
                  placeholder="Current amount (₹) — optional"
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  min="0"
                />
                <input
                  type="date" name="deadline" value={form.deadline} onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  required
                />

                <div className="mt-2 flex justify-end gap-3 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setForm(initialForm); }}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {submitting ? "Creating..." : "Create Goal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// ─── SummaryCard ──────────────────────────────────────────────────────────────
const SummaryCard = ({ title, value, icon, iconClasses }) => (
  <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-3 text-xl font-semibold text-gray-800">{value}</p>
      </div>
      <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ${iconClasses}`}>
        {icon}
      </div>
    </div>
  </div>
);

// ─── GoalCard ─────────────────────────────────────────────────────────────────
const GoalCard = ({ goal, progressValue, onProgressChange, onUpdate, onDelete }) => {
  const percentage = Math.min(100, Math.round(goal.progress.percentage || 0));
  const remaining  = Math.max(0, goal.targetAmount - goal.progress.currentAmount);
  const daysLeft   = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isAchieved = percentage >= 100;
  const isAtRisk   = !isAchieved && daysLeft <= 7;

  const barColor = isAchieved ? "bg-green-500" : isAtRisk ? "bg-red-500" : "bg-blue-500";

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${isAchieved ? "border-green-200" : ""}`}>
      {/* Top row */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-gray-800">{goal.title}</h3>
            {isAchieved && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Achieved 🎉</span>}
            {isAtRisk   && <span className="rounded-full bg-red-100   px-2 py-0.5 text-xs font-medium text-red-600">At Risk ⚠️</span>}
          </div>
          <p className="mt-1 text-sm text-gray-500 capitalize">
            Type: {goal.type} · Deadline: {new Date(goal.deadline).toLocaleDateString("en-IN")}
            <span className={`ml-2 text-sm ${daysLeft <= 7 ? "font-medium text-red-500" : "text-gray-400"}`}>
              {daysLeft >= 0 ? `(${daysLeft} days left)` : "(Past deadline)"}
            </span>
          </p>
        </div>
        <button
          onClick={onDelete}
          className="rounded-lg px-3 py-1 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
        >
          Delete
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">Progress</p>
        <p className="text-sm font-semibold text-slate-700">{percentage}%</p>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mb-4 mt-1 font-mono text-xs text-slate-400">
        {"█".repeat(Math.round(percentage / 10))}{"░".repeat(10 - Math.round(percentage / 10))} {percentage}%
      </p>

      {/* Metrics */}
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Saved"     value={`₹${goal.progress.currentAmount.toLocaleString("en-IN")}`} />
        <Metric label="Target"    value={`₹${goal.targetAmount.toLocaleString("en-IN")}`} />
        <Metric label="Remaining" value={`₹${remaining.toLocaleString("en-IN")}`} />
      </div>

      {/* Update input — hide if already achieved */}
      {!isAchieved && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            value={progressValue}
            onChange={(e) => onProgressChange(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Update current amount (₹)"
            min="0"
          />
          <button
            onClick={onUpdate}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-700 transition"
          >
            Update Progress
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Metric ───────────────────────────────────────────────────────────────────
const Metric = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-2 text-base font-semibold text-gray-800">{value}</p>
  </div>
);

export default Goals;
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

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [progressInputs, setProgressInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const [goalsRes, transactionsRes] = await Promise.all([
        api.get("/goals"),
        api.get("/transactions"),
      ]);
      setGoals(goalsRes.data);
      setTransactions(transactionsRes.data);
      setProgressInputs(
        goalsRes.data.reduce((acc, goal) => {
          acc[goal._id] = goal.currentAmount;
          return acc;
        }, {})
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/goals", {
        ...form,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
      });
      setGoals((prev) => [res.data, ...prev]);
      setProgressInputs((prev) => ({
        ...prev,
        [res.data._id]: res.data.currentAmount ?? 0,
      }));
      setForm(initialForm);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (goal) => {
    try {
      await api.put(`/goals/${goal._id}`, {
        currentAmount: Number(progressInputs[goal._id] ?? goal.currentAmount),
      });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const calculateGoalProgress = (goal) => {
    let relevant = transactions;

    if (goal.type === "income") {
      relevant = transactions.filter((t) => t.type === "income");
    }

    if (goal.type === "expense") {
      relevant = transactions.filter((t) => t.type === "expense");
    }

    if (goal.type === "saving") {
      const income = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const current = income - expense;
      const percentage = (current / goal.targetAmount) * 100;

      return {
        currentAmount: current,
        percentage,
        status:
          percentage >= 100
            ? "achieved"
            : percentage < 50
            ? "at-risk"
            : "on-track",
      };
    }

    const current = relevant.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (current / goal.targetAmount) * 100;

    return {
      currentAmount: current,
      percentage,
      status:
        percentage >= 100
          ? "achieved"
          : percentage < 50
          ? "at-risk"
          : "on-track",
    };
  };

  const today = new Date();
  const goalsWithProgress = goals.map((goal) => ({
    ...goal,
    progress: calculateGoalProgress(goal),
  }));
  const achievedGoals = goalsWithProgress.filter(
    (goal) => goal.progress.percentage >= 100
  );
  const atRiskGoals = goalsWithProgress.filter((goal) => {
    const deadline = new Date(goal.deadline);
    const incomplete = goal.progress.percentage < 100;
    const daysLeft = (deadline - today) / (1000 * 60 * 60 * 24);
    return incomplete && daysLeft <= 14;
  });
  const activeGoals = goalsWithProgress.filter(
    (goal) => goal.progress.percentage < 100
  );

  return (
    <MainLayout>
      <div className="min-h-full space-y-6 bg-slate-50 p-8">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Goals & Targets
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Track savings progress and keep an eye on what needs attention.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <span className="mr-2 text-lg leading-none">+</span>
            Set New Goal
          </button>
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          <SummaryCard
            title="Active Goals"
            value={activeGoals.length}
            icon="GO"
            iconClasses="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            title="Achieved Goals"
            value={achievedGoals.length}
            icon="OK"
            iconClasses="bg-emerald-50 text-emerald-500"
          />
          <SummaryCard
            title="At Risk"
            value={atRiskGoals.length}
            icon="!"
            iconClasses="bg-rose-50 text-rose-500"
          />
        </div>

        <section>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Active Goals
            </h2>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-slate-500 shadow-sm">
              Loading goals...
            </div>
          ) : activeGoals.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-300 text-2xl font-semibold text-slate-400">
                GO
              </div>
              <p className="mb-3 text-sm text-gray-500">
                No active goals set
              </p>
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
                  progressValue={
                    progressInputs[goal._id] ?? goal.progress.currentAmount
                  }
                  onProgressChange={(value) =>
                    setProgressInputs({
                      ...progressInputs,
                      [goal._id]: value,
                    })
                  }
                  onUpdate={() => handleUpdateProgress(goal)}
                  onDelete={() => handleDeleteGoal(goal._id)}
                />
              ))}
            </div>
          )}
        </section>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    Set New Goal
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Create a savings target and track progress automatically.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setForm(initialForm);
                  }}
                  className="text-slate-400 transition hover:text-slate-600"
                >
                  X
                </button>
              </div>

              <form
                onSubmit={handleCreateGoal}
                className="grid gap-4 md:grid-cols-2"
              >
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Goal title"
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  required
                />

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="saving">Saving</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                <input
                  type="number"
                  name="targetAmount"
                  value={form.targetAmount}
                  onChange={handleChange}
                  placeholder="Target amount"
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  required
                />

                <input
                  type="number"
                  name="currentAmount"
                  value={form.currentAmount}
                  onChange={handleChange}
                  placeholder="Current amount"
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />

                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  required
                />

                <div className="mt-2 flex justify-end gap-3 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setForm(initialForm);
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white"
                  >
                    Create Goal
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

const SummaryCard = ({ title, value, icon, iconClasses }) => {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-3 text-xl font-semibold text-gray-800">{value}</p>
        </div>

        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold ${iconClasses}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const GoalCard = ({
  goal,
  progressValue,
  onProgressChange,
  onUpdate,
  onDelete,
}) => {
  const percentage = Math.min(100, Math.round(goal.progress.percentage || 0));
  const remaining = Math.max(0, goal.targetAmount - goal.progress.currentAmount);
  const daysLeft = Math.ceil(
    (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const progress = {
    percentage,
    status:
      goal.progress.status === "on-track"
        ? daysLeft <= 7
          ? "at-risk"
          : "active"
        : goal.progress.status,
  };

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{goal.title}</h3>
          <p className="mt-1 text-sm text-gray-500">
            Deadline: {new Date(goal.deadline).toLocaleDateString()}{" "}
            <span
              className={`ml-2 text-sm ${
                daysLeft <= 7 ? "font-medium text-red-500" : "text-gray-500"
              }`}
            >
              {daysLeft >= 0 ? `${daysLeft} days left` : "Past deadline"}
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

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">Progress</p>
        <p className="text-sm font-semibold text-slate-700">{percentage}%</p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress.status === "achieved"
              ? "bg-green-500"
              : progress.status === "at-risk"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <p className="mb-5 font-mono text-sm text-slate-500">
        {renderProgressBlocks(percentage)} {percentage}%
      </p>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Metric label="Saved" value={`Rs.${goal.progress.currentAmount}`} />
        <Metric label="Target" value={`Rs.${goal.targetAmount}`} />
        <Metric label="Remaining" value={`Rs.${remaining}`} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          value={progressValue}
          onChange={(e) => onProgressChange(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          placeholder="Update progress"
        />

        <button
          onClick={onUpdate}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          Update Progress
        </button>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-gray-800">{value}</p>
    </div>
  );
};

const renderProgressBlocks = (percentage) => {
  const filled = Math.round(percentage / 10);
  return `${"#".repeat(filled)}${"-".repeat(10 - filled)}`;
};

export default Goals;

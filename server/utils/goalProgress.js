const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");

const clampGoalAmount = (amount, targetAmount) => {
  return Math.max(0, Math.min(amount, targetAmount));
};

const getGoalDeltaForTransaction = (type, amount) => {
  if (type === "income") return amount;
  if (type === "expense") return -amount;
  return 0;
};

const applySavingsDeltaToGoals = async (userId, delta) => {
  if (!delta) return;

  const goals = await Goal.find({ user: userId });

  await Promise.all(
    goals.map(async (goal) => {
      goal.currentAmount = clampGoalAmount(
        goal.currentAmount + delta,
        goal.targetAmount
      );
      await goal.save();
    })
  );
};

const getSavingsBalanceForUser = async (userId) => {
  const transactions = await Transaction.find({ user: userId });

  return transactions.reduce((total, transaction) => {
    return total + getGoalDeltaForTransaction(transaction.type, Number(transaction.amount));
  }, 0);
};

module.exports = {
  applySavingsDeltaToGoals,
  clampGoalAmount,
  getGoalDeltaForTransaction,
  getSavingsBalanceForUser,
};

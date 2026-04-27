const Goal = require("../models/goalModel");
const {
  clampGoalAmount,
  getSavingsBalanceForUser,
} = require("../utils/goalProgress");

const createGoal = async (req, res) => {
  try {
    const { title, type = "saving", targetAmount, currentAmount = 0, deadline } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const normalizedTargetAmount = Number(targetAmount);
    const hasStartingAmount =
      currentAmount !== undefined && currentAmount !== null && currentAmount !== "";
    const derivedAmount = hasStartingAmount
      ? Number(currentAmount)
      : await getSavingsBalanceForUser(req.user.id);

    const goal = await Goal.create({
      user: req.user.id,
      title,
      type,
      targetAmount: normalizedTargetAmount,
      currentAmount: clampGoalAmount(derivedAmount, normalizedTargetAmount),
      deadline,
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const { title, type, targetAmount, currentAmount, deadline } = req.body;

    if (title !== undefined) goal.title = title;
    if (type !== undefined) goal.type = type;
    if (deadline !== undefined) goal.deadline = deadline;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (currentAmount !== undefined) {
      goal.currentAmount = clampGoalAmount(
        Number(currentAmount),
        goal.targetAmount
      );
    }

    if (currentAmount === undefined && targetAmount !== undefined) {
      goal.currentAmount = clampGoalAmount(goal.currentAmount, goal.targetAmount);
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await goal.deleteOne();
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};

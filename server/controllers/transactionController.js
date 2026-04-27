const Transaction = require("../models/Transaction");
const {
  applySavingsDeltaToGoals,
  getGoalDeltaForTransaction,
} = require("../utils/goalProgress");

const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      category,
      description,
      date,
    });

    await applySavingsDeltaToGoals(
      req.user.id,
      getGoalDeltaForTransaction(type, Number(amount))
    );

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }

    const { type, amount, category, description, date } = req.body;

    const previousDelta = getGoalDeltaForTransaction(
      transaction.type,
      Number(transaction.amount)
    );
    const nextType = type ?? transaction.type;
    const nextAmount = amount ?? transaction.amount;
    const nextDelta = getGoalDeltaForTransaction(nextType, Number(nextAmount));

    transaction.type = type ?? transaction.type;
    transaction.amount = amount ?? transaction.amount;
    transaction.category = category ?? transaction.category;
    transaction.description = description ?? transaction.description;
    transaction.date = date ?? transaction.date;

    const updatedTransaction = await transaction.save();
    await applySavingsDeltaToGoals(req.user.id, nextDelta - previousDelta);
    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Not found" });
    }

    await applySavingsDeltaToGoals(
      req.user.id,
      -getGoalDeltaForTransaction(transaction.type, Number(transaction.amount))
    );
    await transaction.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};

import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import TransactionsTable from "../components/dashboard/TransactionsTable";
import api from "../services/api";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);

  // form state
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  // category mapping
  const categories = {
    expenses: [
      "Office Supplies",
      "Utilities",
      "Travel",
      "Meals",
      "Software",
      "Services",
    ],
    investments: [
      "Equipment",
      "Technology",
      "Marketing",
      "Training",
      "Research",
    ],
    sales: [
      "Product Sales",
      "Service Revenue",
      "Consulting",
      "Licensing",
      "Other Revenue",
    ],
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        amount: editingTransaction.amount,
        description: editingTransaction.description || "",
        category: editingTransaction.category,
        date: editingTransaction.date.split("T")[0],
      });
      setShowModal(true);
    }
  }, [editingTransaction]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // filter data
  const filteredTransactions = transactions.filter((t) => {
    const typeMatch =
      (activeTab === "expenses" && t.type === "expense") ||
      (activeTab === "sales" && t.type === "income") ||
      (activeTab === "investments" && t.type === "investment");

    const categoryMatch =
      selectedCategory === "" || t.category === selectedCategory;

    const searchMatch =
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());

    return typeMatch && categoryMatch && searchMatch;
  });

  // handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // submit
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        type:
          activeTab === "expenses"
            ? "expense"
            : activeTab === "sales"
            ? "income"
            : "investment",
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      setShowModal(false);
      setEditingTransaction(null);
      setForm({
        amount: "",
        description: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });

      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    console.log("Deleting:", id);
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Daily Finance Tracking
          </h1>

          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            + Add {activeTab.slice(0, -1)}
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-8 border-b mb-6 text-lg">
          {["investments", "expenses", "sales"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedCategory("");
                setSearch("");
              }}
              className={`pb-2 capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/3 rounded border p-2"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded border p-2"
          >
            <option value="">All Categories</option>
            {categories[activeTab].map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* CONTENT */}
        {loading ? (
          <p>Loading...</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow text-center">
            <p className="text-gray-500 mb-4">
              No {activeTab} recorded yet
            </p>

            <button
              onClick={() => {
                setEditingTransaction(null);
                setShowModal(true);
              }}
              className="border px-4 py-2 rounded-lg"
            >
              + Add First {activeTab.slice(0, -1)}
            </button>
          </div>
        ) : (
          <TransactionsTable
            transactions={filteredTransactions}
            onEdit={(t) => setEditingTransaction(t)}
            onDelete={handleDelete}
          />
        )}

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[420px]">

              <h2 className="text-xl font-semibold mb-4">
                {editingTransaction
                  ? "Edit Transaction"
                  : `Add New ${activeTab.slice(0, -1)}`}
              </h2>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Amount"
                className="w-full border p-2 mb-3 rounded"
              />

              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full border p-2 mb-3 rounded"
              />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border p-2 mb-3 rounded"
              >
                <option value="">Select Category</option>
                {categories[activeTab].map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border p-2 mb-4 rounded"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add Transaction
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Transactions;

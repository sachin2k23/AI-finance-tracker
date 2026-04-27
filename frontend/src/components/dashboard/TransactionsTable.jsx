const TransactionsTable = ({ transactions, onEdit, onDelete }) => {
  return (
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
              <th className="py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>

                  <td className="py-2 capitalize">{transaction.type}</td>

                  <td className="py-2">{transaction.category}</td>

                  <td
                    className={`py-2 font-medium ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}Rs.{transaction.amount}
                  </td>

                  <td className="py-2 text-gray-500">
                    {transaction.description || "-"}
                  </td>

                  <td className="py-2">
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          console.log("Editing:", transaction);
                          onEdit(transaction);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(transaction._id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;

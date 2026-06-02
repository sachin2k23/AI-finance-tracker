exports.getAIInsights = async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.status(400).json({ message: "No transactions provided" });
    }

    // Build compact summary — never send raw DB IDs to Claude
    const sumType = (arr, type) =>
      arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

    const totalIncome     = sumType(transactions, "income");
    const totalExpense    = sumType(transactions, "expense");
    const totalInvestment = sumType(transactions, "investment");
    const netProfit       = totalIncome - totalExpense;

    // Category breakdown
    const categoryMap = {};
    transactions.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: Rs.${amt.toLocaleString("en-IN")}`)
      .join(", ");

    const prompt = `You are a smart AI finance advisor for an Indian business.
Analyze this financial summary and return EXACTLY 3 insights as a JSON array.

Financial Summary:
- Total Income: Rs.${totalIncome.toLocaleString("en-IN")}
- Total Expenses: Rs.${totalExpense.toLocaleString("en-IN")}
- Total Investment: Rs.${totalInvestment.toLocaleString("en-IN")}
- Net Profit: Rs.${netProfit.toLocaleString("en-IN")}
- Top spending categories: ${topCategories || "No data yet"}
- Total transactions: ${transactions.length}

Return ONLY this JSON, no markdown, no extra text:
[
  { "type": "positive"|"warning"|"suggestion", "message": "concise insight under 20 words" },
  { "type": "positive"|"warning"|"suggestion", "message": "concise insight under 20 words" },
  { "type": "positive"|"warning"|"suggestion", "message": "concise insight under 20 words" }
]`;

    // ✅ Uses Node 18+ native fetch — no axios needed
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "[]";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    res.json({ insights: parsed });
  } catch (error) {
    console.error("AI Insights error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to generate AI insights" });
  }
};
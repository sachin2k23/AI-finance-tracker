import { useState } from "react";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";


function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage("");

  try {
    const response = await api.post("/auth/login", {
      email: formData.email.trim(),
      password: formData.password,
    });

    // Save token
    localStorage.setItem("token", response.data.token);

    // alert("Login successful ✅");

    // Redirect to dashboard
    navigate("/dashboard");
  } catch (error) {
    const message = error.response?.data?.message || "Login failed";
    setErrorMessage(message);
    console.error("Login failed:", error.response?.data || error.message);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 flex items-center justify-center rounded-full bg-blue-600 text-white">
            📊
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center">FinanceTracker</h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your account
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-blue-600 mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

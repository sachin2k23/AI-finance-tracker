import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";


function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Business Owner",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post("/auth/register", {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role === "Business Owner" ? "admin" : "biller",
    });

    alert("Signup successful ✅");
    console.log(response.data);
  } catch (error) {
    alert(
      error.response?.data?.message || "Signup failed"
    );
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
          Create your business account
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

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
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            >
              <option>Business Owner</option>
              <option>Accountant</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-blue-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

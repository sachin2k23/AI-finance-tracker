import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-finance-tracker-fiyo.onrender.com/api",
});

// ✅ Simple cache for GET requests (5 minute TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    // ✅ Cache GET requests
    if (res.config.method === "get") {
      const cacheKey = res.config.url;
      cache.set(cacheKey, {
        data: res.data,
        timestamp: Date.now(),
      });
    }
    return res;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ✅ Add request interceptor to check cache first
api.interceptors.request.use((config) => {
  if (config.method === "get") {
    const cacheKey = config.url;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Return cached data without making a network request
      return Promise.resolve({
        data: cached.data,
        config,
        status: 200,
        statusText: "OK (from cache)",
        headers: {},
      });
    }
  }
  return config;
});

export default api;

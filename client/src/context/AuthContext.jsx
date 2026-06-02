import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// ✅ Decode JWT payload without any external library
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ✅ Check token exists AND is not expired
const getValidToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
  if (isExpired) {
    localStorage.removeItem("token");
    return null;
  }

  return { token, decoded };
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    // ✅ On every page load/refresh, restore user from the saved token
    const valid = getValidToken();
    if (!valid) return { token: null, user: null };

    // Try to get user data from localStorage first, fallback to JWT
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : (valid.decoded.user || valid.decoded || null);

    return {
      token: valid.token,
      user,
    };
  });

  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // ✅ Store user data for fast access
    setAuthState({ token, user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({ token: null, user: null });
  };

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        user: authState.user,
        isAuthenticated: !!authState.token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import { useEffect } from "react";

const BACKEND_URL = "https://ai-finance-tracker-fiyo.onrender.com";
const PING_INTERVAL_MS = 10 * 60 * 1000; // every 10 minutes

// ✅ Pings the backend every 10 minutes so Render never sleeps
// Drop this hook into App.jsx — it runs silently in the background
const useKeepAlive = () => {
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch(`${BACKEND_URL}/`, { method: "GET" });
        console.log("[KeepAlive] Backend pinged ✅");
      } catch {
        // Silent fail — don't crash the app if ping fails
      }
    };

    // Ping once immediately when app loads
    ping();

    // Then ping every 10 minutes
    const interval = setInterval(ping, PING_INTERVAL_MS);

    return () => clearInterval(interval); // this work s her ein the unlikely event the component unmounts
  }, []);
};

export default useKeepAlive;
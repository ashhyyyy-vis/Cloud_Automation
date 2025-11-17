import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function HeaderBar({ toggleSidebar }) {
  const { offset } = useContext(AuthContext);
  const [time, setTime] = useState(Date.now() + offset);

  useEffect(() => {
    if (offset == null) return;

    const interval = setInterval(() => {
      setTime(Date.now() + offset);
    }, 1000);

    return () => clearInterval(interval);
  }, [offset]);

  if (offset == null) {
    return (
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <button onClick={toggleSidebar}>☰</button>
        <span>Fetching time...</span>
      </div>
    );
  }

  const dateObj = new Date(time);

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow">
      <button onClick={toggleSidebar}>☰</button>
      <div className="text-right">
        <p>{dateObj.toLocaleTimeString()}</p>
        <p className="text-xs text-gray-600">{dateObj.toLocaleDateString()}</p>
      </div>
    </div>
  );
}

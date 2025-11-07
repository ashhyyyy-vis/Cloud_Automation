import { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/API";

export default function StartSession() {
  const { courseId } = useParams();
  const [duration, setDuration] = useState(3);

  const start = async () => {
    try {
      const res = await API.post(`/teacher/session/start`, {
        courseId,
        duration,
      });
    } catch (error) {
      console.error("Error starting session:", error);
    }

    window.location.href = `/qr/${res.data.session.id}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Start Session</h1>

      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="border p-2 mb-3"
      />

      <button
        onClick={start}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Start Session
      </button>
    </div>
  );
}

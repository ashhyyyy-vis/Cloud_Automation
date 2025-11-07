import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function LiveAttendance() {
  const { sessionId } = useParams();
  const [present, setPresent] = useState([]);

  const load = async () => {
    const res = await API.get(`/teacher/session/${sessionId}/live`);
    setPresent(res.data.presentStudents);
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Live Attendance</h1>

      <div className="border rounded p-3 bg-gray-100">
        {present.length === 0 && <p>No students yet...</p>}

        {present.map((id) => (
          <div key={id} className="p-2 border-b">
            Student: {id}
          </div>
        ))}
      </div>

      <a
        href={`/end/${sessionId}`}
        className="bg-red-600 mt-6 inline-block text-white px-4 py-2 rounded"
      >
        End Session
      </a>
    </div>
  );
}

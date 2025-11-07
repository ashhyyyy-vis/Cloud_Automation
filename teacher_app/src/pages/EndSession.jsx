import { useParams } from "react-router-dom";
import API from "../api/api";

export default function EndSession() {
  const { sessionId } = useParams();

  const end = async () => {
    await API.post(`/teacher/session/${sessionId}/end`);
    alert("Session ended");
    window.location.href = "/courses";
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">End Session</h1>
      <button onClick={end} className="bg-red-600 text-white p-2 rounded">
        End Session
      </button>
    </div>
  );
}

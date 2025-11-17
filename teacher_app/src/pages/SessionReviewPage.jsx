import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";

export default function SessionReviewPage() {
  const { sessionId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState(null); // <-- backend summary result

  // ------------------------------
  // FETCH STUDENT LIST
  // ------------------------------
  const fetchStudents = async () => {
    try {
      const res = await api.get(`/teacher/sessions/${sessionId}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudents(res.data.students || []);
    } catch (err) {
      console.error("STUDENT FETCH ERROR:", err);
    }

    setLoading(false);
  };

  // ------------------------------
  // TOGGLE PRESENT / ABSENT
  // ------------------------------
  const togglePresence = (id) => {
    let updatedRowWasEdited = editedRows[id] || false;

    setStudents((prev) =>
      prev.map((stu) =>
        stu.id === id ? { ...stu, present: !stu.present } : stu
      )
    );

    setEditedRows((prev) => ({
      ...prev,
      [id]: !updatedRowWasEdited ? true : false,
    }));
  };

  // ------------------------------
  // SAVE FINAL ATTENDANCE
  // ------------------------------
  const saveAttendance = async () => {
    setSaving(true);

    const presentIds = students
      .filter((stu) => stu.present)
      .map((stu) => stu.id);

    try {
      const res = await api.post(
        `/teacher/sessions/${sessionId}/mark`,
        { studentIds: presentIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSummary(res.data.summary); // show result summary
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Failed to save attendance.");
    }

    setSaving(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Session Review</h1>

      {loading ? (
        <p>Loading students...</p>
      ) : (
        <div className="bg-white shadow-xl rounded-xl p-6">
          {/* SUMMARY BOX */}
          {summary && (
            <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300">
              <p className="font-bold text-lg text-green-800">
                Attendance Saved Successfully!
              </p>

              <p className="mt-2">
                Marked Present:{" "}
                <span className="font-semibold">{summary.markedCount}</span>
              </p>

              {summary.rejectedCount > 0 && (
                <>
                  <p className="mt-2 text-red-600 font-semibold">
                    Rejected: {summary.rejectedCount}
                  </p>

                  <ul className="mt-1 text-sm text-red-700 list-disc ml-6">
                    {summary.rejected.map((r) => (
                      <li key={r.studentId}>
                        {r.studentId} — {r.reason}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <button
                onClick={() => navigate("/home")}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Home
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="p-3 text-left w-20">Present</th>
                  <th className="p-3 text-left">MIS</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Class</th>
                </tr>
              </thead>

              <tbody>
                {students.map((stu) => (
                  <tr
                    key={stu.id}
                    className={`border-b transition 
                      ${editedRows[stu.id] ? "bg-yellow-50" : "bg-white"}
                    `}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={stu.present}
                        onChange={() => togglePresence(stu.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>

                    <td className="p-3 font-bold">{stu.MIS}</td>

                    <td className="p-3 text-gray-700">
                      {stu.firstName} {stu.lastName}
                    </td>

                    <td className="p-3 text-gray-600 text-sm">
                      {stu.class?.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SAVE BUTTON */}
          {!summary && (
            <div className="text-center mt-6">
              <button
                onClick={saveAttendance}
                disabled={saving}
                className="px-8 py-3 rounded-lg bg-blue-600 text-white text-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

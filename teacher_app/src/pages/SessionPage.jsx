import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";

export default function SessionPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // QR state
  const [qrImage, setQrImage] = useState(null);
  const [qrExpiry, setQrExpiry] = useState(null);
  const [qrRemaining, setQrRemaining] = useState(null);

  // Session state
  const [sessionEndTime, setSessionEndTime] = useState(null);
  const [sessionRemaining, setSessionRemaining] = useState(null);

  // Live attendance
  const [presentStudents, setPresentStudents] = useState([]);

  // End message
  const [sessionEnded, setSessionEnded] = useState(false);

  // Interval refs
  const qrIntervalRef = useRef(null);
  const sessionIntervalRef = useRef(null);
  const liveIntervalRef = useRef(null);

  // -------------------------------------------------
  // FETCH QR TOKEN + IMAGE
  // -------------------------------------------------
  const fetchQr = async () => {
    try {
      const res = await api.get(`/teacher/sessions/${sessionId}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQrImage(res.data.qrImage);
      setQrExpiry(res.data.validTo); // absolute utc timestamp
    } catch (err) {
      console.error("QR ERROR:", err);
    }
  };

  // -------------------------------------------------
  // END SESSION
  // -------------------------------------------------
  const endSession = async () => {
    try {
      await api.post(
        `/teacher/sessions/${sessionId}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSessionEnded(true);

      setTimeout(() => {
        navigate(`/session/${sessionId}/review`);
      }, 800);
    } catch (err) {
      console.error("END SESSION ERROR:", err);
    }
  };

  // -------------------------------------------------
  // LIVE ATTENDANCE
  // -------------------------------------------------
  const fetchLive = async () => {
    try {
      const res = await api.get(`/teacher/sessions/${sessionId}/live`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPresentStudents(res.data.presentStudents || []);
    } catch (err) {
      console.error("LIVE ATTENDANCE ERROR:", err);
    }
  };

  // -------------------------------------------------
  // INITIALIZE TIMERS
  // -------------------------------------------------
  useEffect(() => {
    fetchQr();
    fetchLive();

    // get endTime from navigation (sent from Start Session)
    const sessionData = location.state?.session;
    if (sessionData?.endTime) {
      setSessionEndTime(new Date(sessionData.endTime).getTime());
    }

    // ---- QR countdown ----
    qrIntervalRef.current = setInterval(() => {
      if (!qrExpiry) return;

      const now = Date.now();
      const remaining = Math.max(Math.floor((qrExpiry - now) / 1000), 0);
      setQrRemaining(remaining);

      if (remaining <= 0) fetchQr();
    }, 1000);

    // ---- SESSION countdown ----
    sessionIntervalRef.current = setInterval(() => {
      if (!sessionEndTime) return;

      const now = Date.now();
      const remaining = Math.max(Math.floor((sessionEndTime - now) / 1000), 0);
      setSessionRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(sessionIntervalRef.current);
        endSession(); // AUTO END
      }
    }, 1000);

    // ---- Live Attendance every 5 sec ----
    liveIntervalRef.current = setInterval(fetchLive, 5000);

    return () => {
      clearInterval(qrIntervalRef.current);
      clearInterval(sessionIntervalRef.current);
      clearInterval(liveIntervalRef.current);
    };
  }, [qrExpiry, sessionEndTime]);

  // Format mm:ss
  const format = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  return (
    <div className="min-h-screen p-10 bg-gray-100 flex gap-6">
      {/* LEFT — LIVE ATTENDANCE */}
      <div className="w-1/3">
        <div className="bg-white h-full p-4 shadow-xl rounded-xl overflow-y-auto">
          <h2 className="text-xl font-semibold mb-3">Live Attendance</h2>

          {presentStudents.length === 0 ? (
            <p className="text-gray-500">No students yet...</p>
          ) : (
            <ul className="space-y-3">
              {presentStudents.map((stu) => (
                <li
                  key={stu.id}
                  className="p-3 bg-green-50 border border-green-300 rounded-lg shadow-sm"
                >
                  <p className="font-bold text-lg">{stu.MIS}</p>
                  <p className="text-sm text-gray-700">
                    {stu.firstName} {stu.lastName}
                  </p>
                  {stu.Class && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stu.Class.name}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* CENTER — QR */}
      <div className="flex-1 flex flex-col items-center">
        <div className="bg-white p-6 shadow-xl rounded-xl">
          {qrImage ? (
            <img src={qrImage} className="w-[420px] h-[420px]" />
          ) : (
            <p>Loading QR...</p>
          )}
        </div>

        {sessionEnded && (
          <p className="mt-6 text-red-600 font-bold text-xl">
            Session ended — redirecting...
          </p>
        )}
      </div>

      {/* RIGHT — TIMERS */}
      <div className="w-1/4">
        <div className="bg-white p-4 shadow-xl rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Timers</h2>

          <p className="text-lg">
            <b>Session Ends In:</b>
            <br />
            <span className="text-red-600">
              {sessionRemaining !== null ? format(sessionRemaining) : "..."}
            </span>
          </p>

          <p className="text-lg mt-6">
            <b>QR Refresh In:</b>
            <br />
            <span className="text-blue-600">
              {qrRemaining !== null ? `${qrRemaining}s` : "..."}
            </span>
          </p>

          <button
            onClick={endSession}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full"
          >
            End Session Now
          </button>
        </div>
      </div>
    </div>
  );
}

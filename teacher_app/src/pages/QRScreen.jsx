import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function QRScreen() {
  const { sessionId } = useParams();
  const [qr, setQr] = useState("");

  const loadQR = async () => {
    const res = await API.get(`/teacher/session/${sessionId}/qr`);
    setQr(res.data.qrToken);
  };

  useEffect(() => {
    loadQR();
    const interval = setInterval(loadQR, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-xl font-bold mb-4">QR Code</h1>

      <div className="mt-4 p-4 border inline-block">
        <p className="text-sm font-mono break-all">{qr}</p>
      </div>

      <a
        className="mt-6 block text-blue-600 underline"
        href={`/live/${sessionId}`}
      >
        View Live Attendance
      </a>
    </div>
  );
}

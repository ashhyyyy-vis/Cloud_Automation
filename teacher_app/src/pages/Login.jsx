import { useState } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
        role: "teacher",
      });
      login(res.data.user, res.data.data.token);
      window.location.href = "/courses";
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white shadow rounded w-96">
        <h1 className="text-2xl font-bold mb-4">Teacher Login</h1>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white p-2 w-full rounded"
          onClick={submit}
        >
          Login
        </button>
      </div>
    </div>
  );
}

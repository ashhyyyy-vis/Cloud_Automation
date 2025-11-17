import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const menu = [
    { name: "Dashboard", path: "/home" },
    { name: "Attendance Report", path: "/report" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 
        ${isOpen ? "w-64" : "w-16"}`}
    >
      <div className="h-16" /> {/* spacing below Header */}
      {isOpen && (
        <nav className="p-4 space-y-3 text-gray-700">
          <p className="text-sm font-semibold text-gray-500 mb-2">Navigation</p>

          {/* Dynamic Menu */}
          {menu.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                cursor-pointer p-2 rounded transition 
                ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }
              `}
            >
              {item.name}
            </div>
          ))}

          {/* LOGOUT Button */}
          <div
            onClick={handleLogout}
            className="cursor-pointer hover:bg-red-100 p-2 rounded text-red-600 font-semibold mt-4"
          >
            Logout
          </div>
        </nav>
      )}
    </aside>
  );
}

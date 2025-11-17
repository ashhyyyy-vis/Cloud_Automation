import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import DashboardLayout from "@/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { user, token } = useContext(AuthContext);

  // hooks
  const navigate = useNavigate();

  // state
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [duration, setDuration] = useState(3);
  const { offset } = useContext(AuthContext);
  const [time, setTime] = useState(Date.now() + offset);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now() + offset);
    }, 1000);

    return () => clearInterval(interval);
  }, [offset]);

  // fetch courses on load
  useEffect(() => {
    if (!token) return;

    api
      .get("/teacher/sessions/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("COURSES API RESULT:", res.data);
        setCourses(res.data.courses || []);
      })
      .catch((err) => console.error("COURSE FETCH ERROR:", err));
  }, [token]);

  // toggle class selection
  const toggleClass = (cls) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  // start session
  const handleStartSession = () => {
    if (!selectedCourse || selectedClasses.length === 0) return;

    const payload = {
      courseId: selectedCourse.id,
      classIds: selectedClasses.map((cls) => cls.id),
      duration,
    };

    api
      .post("/teacher/sessions/start", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("SESSION STARTED:", res.data);

        const session = res.data.session;
        const sessionId = res.data.session.id; // CORRECT SOURCE

        navigate(`/session/${sessionId}`, { state: { session } });
      })
      .catch((err) => console.error("SESSION START ERROR:", err));
  };

  return (
    <DashboardLayout>
      {/* TRUE BACKGROUND IMAGE */}
      <div
        className="min-h-screen bg-cover bg-center pb-10"
        style={{
          backgroundImage: "url('/bg-teacher.jpg')",
          backgroundAttachment: "fixed",
        }}
      >
        {/* CENTER PROFILE BOX */}
        <Card className="max-w-5xl mx-auto mb-10 mt-10 shadow-lg border border-gray-200 bg-white/90">
          <CardHeader>
            <CardTitle className="text-xl">Teacher Profile</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex justify-center md:justify-start">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile details */}
              <div className="text-gray-700 space-y-2">
                <p className="text-xl font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p>{user?.email}</p>
                <p>Faculty ID: {user?.facultyId}</p>
                <p>Department: {user?.department}</p>
                <p>Role: {user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* COURSE & CLASS SELECTOR */}
        <Card className="max-w-5xl mx-auto shadow-lg border border-gray-200 bg-white/90">
          <CardHeader>
            <CardTitle className="text-xl">Start Attendance Session</CardTitle>
          </CardHeader>

          <CardContent>
            {/* COURSES */}
            <p className="text-lg font-semibold mb-2">Choose Course</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedClasses([]);
                  }}
                  className={`cursor-pointer p-5 rounded-xl border text-center transition shadow-sm 
                    ${
                      selectedCourse?.id === course.id
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-300 bg-white/70 backdrop-blur hover:bg-gray-100"
                    }`}
                >
                  <p className="font-bold text-md">{course.name}</p>
                  <p className="text-xs text-gray-600">{course.code}</p>
                </div>
              ))}
            </div>

            {/* CLASSES */}
            {selectedCourse && (
              <>
                <p className="text-lg font-semibold mb-2">Choose Classes</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {selectedCourse.Classes.map((cls) => (
                    <div
                      key={cls.id}
                      onClick={() => toggleClass(cls)}
                      className={`cursor-pointer p-4 rounded-xl border text-center transition shadow-sm
                        ${
                          selectedClasses.includes(cls)
                            ? "border-green-600 bg-green-50 shadow-md"
                            : "border-gray-300 bg-white/70 backdrop-blur hover:bg-gray-100"
                        }`}
                    >
                      <p className="font-semibold">{cls.name}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* DURATION */}
            {selectedClasses.length > 0 && (
              <div className="mb-6">
                <p className="text-lg font-semibold mb-2">Session Duration</p>

                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="border border-gray-300 p-2 rounded w-40"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} minutes
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* START BUTTON */}
            {selectedCourse && selectedClasses.length > 0 && (
              <Button className="mt-4" onClick={handleStartSession}>
                Start Session
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

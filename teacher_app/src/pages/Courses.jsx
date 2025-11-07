export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    API.get("/teacher/session/courses").then((response) => {
      setCourses(response.data.courses);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Your Courses</h1>

      <div className="grid grid-cols-1 gap-3">
        {courses.map((c) => (
          <a
            key={c.id}
            href={`/start-session/${c.id}`}
            className="p-4 border rounded hover:bg-gray-100"
          >
            {c.name} ({c.code})
          </a>
        ))}
      </div>
    </div>
  );
}

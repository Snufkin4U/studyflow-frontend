import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);

  const loadDashboard = () => {
    fetch("http://localhost:8080/api/dashboard/summary")
      .then((response) => response.json())
      .then((data) => setSummary(data));

    fetch("http://localhost:8080/api/tasks?size=20&sortBy=deadline&direction=asc")
      .then((response) => response.json())
      .then((data) => {
        const openTasks = data.content
          .filter((task) => task.status !== "DONE")
          .slice(0, 5);

        setTasks(openTasks);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const markTaskAsDone = (taskId) => {
    fetch(`http://localhost:8080/api/tasks/${taskId}/status?status=DONE`, {
      method: "PUT",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update task status");
        }

        return response.json();
      })
      .then(() => loadDashboard())
      .catch((error) => console.error(error));
  };

  return (
    <div className="app">
      <h1>StudyFlow</h1>
      <p className="subtitle">Smart academic planner dashboard</p>

      {summary && (
        <div className="cards">
          <div className="card">
            <h2>{summary.totalCourses}</h2>
            <p>Courses</p>
          </div>

          <div className="card">
            <h2>{summary.totalTasks}</h2>
            <p>Total Tasks</p>
          </div>

          <div className="card">
            <h2>{summary.openTasks}</h2>
            <p>Open Tasks</p>
          </div>

          <div className="card">
            <h2>{summary.totalEstimatedHoursForOpenTasks}</h2>
            <p>Open Study Hours</p>
          </div>
        </div>
      )}

      <h2>Upcoming Open Tasks</h2>

      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-card" key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>
              <strong>Course:</strong> {task.courseName}
            </p>
            <p>
              <strong>Deadline:</strong> {task.deadline}
            </p>
            <p>
              <strong>Status:</strong> {task.status}
            </p>

            <button onClick={() => markTaskAsDone(task.id)}>
              Mark as Done
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
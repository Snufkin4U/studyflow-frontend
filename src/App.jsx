import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/dashboard/summary")
      .then((response) => response.json())
      .then((data) => setSummary(data));

    fetch("http://localhost:8080/api/tasks?size=5&sortBy=deadline&direction=asc")
      .then((response) => response.json())
      .then((data) => setTasks(data.content));
  }, []);

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

      <h2>Upcoming Tasks</h2>

      <div className="task-list">
        {tasks.map((task) => (
          <div className="task-card" key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p><strong>Course:</strong> {task.courseName}</p>
            <p><strong>Deadline:</strong> {task.deadline}</p>
            <p><strong>Status:</strong> {task.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
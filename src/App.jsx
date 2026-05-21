import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    estimatedHours: 1,
    priority: 3,
    status: "TODO",
    courseId: "",
  });

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

    fetch("http://localhost:8080/api/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  const createTask = (event) => {
    event.preventDefault();

    const taskToCreate = {
      ...newTask,
      estimatedHours: Number(newTask.estimatedHours),
      priority: Number(newTask.priority),
      courseId: Number(newTask.courseId),
    };

    fetch("http://localhost:8080/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskToCreate),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create task");
        }

        return response.json();
      })
      .then(() => {
        setNewTask({
          title: "",
          description: "",
          deadline: "",
          estimatedHours: 1,
          priority: 3,
          status: "TODO",
          courseId: "",
        });

        loadDashboard();
      })
      .catch((error) => console.error(error));
  };

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

  const deleteTask = (taskId) => {
    fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete task");
        }

        loadDashboard();
      })
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

      <section className="form-section">
        <h2>Create New Task</h2>

        <form onSubmit={createTask} className="task-form">
          <input
            name="title"
            placeholder="Task title"
            value={newTask.title}
            onChange={handleInputChange}
            required
          />

          <input
            name="description"
            placeholder="Description"
            value={newTask.description}
            onChange={handleInputChange}
            required
          />

          <input
            name="deadline"
            type="date"
            value={newTask.deadline}
            onChange={handleInputChange}
            required
          />

          <input
            name="estimatedHours"
            type="number"
            min="0.5"
            step="0.5"
            placeholder="Estimated hours"
            value={newTask.estimatedHours}
            onChange={handleInputChange}
            required
          />

          <input
            name="priority"
            type="number"
            min="1"
            max="5"
            placeholder="Priority"
            value={newTask.priority}
            onChange={handleInputChange}
            required
          />

          <select
            name="courseId"
            value={newTask.courseId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <button type="submit">Create Task</button>
        </form>
      </section>

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

            <div className="task-actions">
              <button onClick={() => markTaskAsDone(task.id)}>
                Mark as Done
              </button>

              <button className="delete-button" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
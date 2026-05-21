import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:8080/api";

async function parseErrorResponse(response) {
  try {
    const errorData = await response.json();

    if (errorData.errors) {
      return Object.values(errorData.errors).join(", ");
    }

    if (errorData.message) {
      return errorData.message;
    }

    if (errorData.error) {
      return errorData.error;
    }

    return "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

function App() {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState([]);

  const [message, setMessage] = useState(null);

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const [newCourse, setNewCourse] = useState({
    name: "",
    semester: "",
    difficulty: 3,
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    estimatedHours: 1,
    priority: 3,
    status: "TODO",
    courseId: "",
  });

  const showSuccess = (text) => {
    setMessage({
      type: "success",
      text,
    });
  };

  const showError = (text) => {
    setMessage({
      type: "error",
      text,
    });
  };

  const clearMessage = () => {
    setMessage(null);
  };

  const loadDashboard = useCallback(async () => {
    setIsLoadingDashboard(true);

    try {
      const [summaryResponse, tasksResponse, coursesResponse, progressResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/summary`),
          fetch(`${API_BASE_URL}/tasks?size=20&sortBy=deadline&direction=asc`),
          fetch(`${API_BASE_URL}/courses`),
          fetch(`${API_BASE_URL}/dashboard/courses`),
        ]);

      if (!summaryResponse.ok) {
        throw new Error("Failed to load dashboard summary");
      }

      if (!tasksResponse.ok) {
        throw new Error("Failed to load tasks");
      }

      if (!coursesResponse.ok) {
        throw new Error("Failed to load courses");
      }

      if (!progressResponse.ok) {
        throw new Error("Failed to load course progress");
      }

      const summaryData = await summaryResponse.json();
      const tasksData = await tasksResponse.json();
      const coursesData = await coursesResponse.json();
      const progressData = await progressResponse.json();

      const openTasks = (tasksData.content ?? [])
        .filter((task) => task.status !== "DONE")
        .slice(0, 5);

      setSummary(summaryData);
      setTasks(openTasks);
      setCourses(coursesData);
      setCourseProgress(progressData);
    } catch (error) {
      console.error(error);
      showError("Could not load dashboard data. Make sure the backend is running.");
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleCourseInputChange = (event) => {
    const { name, value } = event.target;

    setNewCourse({
      ...newCourse,
      [name]: value,
    });
  };

  const handleTaskInputChange = (event) => {
    const { name, value } = event.target;

    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  const createCourse = async (event) => {
    event.preventDefault();
    clearMessage();
    setIsCreatingCourse(true);

    const courseToCreate = {
      ...newCourse,
      difficulty: Number(newCourse.difficulty),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseToCreate),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      setNewCourse({
        name: "",
        semester: "",
        difficulty: 3,
      });

      await loadDashboard();
      showSuccess("Course created successfully.");
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to create course.");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    clearMessage();
    setIsCreatingTask(true);

    const taskToCreate = {
      ...newTask,
      estimatedHours: Number(newTask.estimatedHours),
      priority: Number(newTask.priority),
      courseId: Number(newTask.courseId),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskToCreate),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      setNewTask({
        title: "",
        description: "",
        deadline: "",
        estimatedHours: 1,
        priority: 3,
        status: "TODO",
        courseId: "",
      });

      await loadDashboard();
      showSuccess("Task created successfully.");
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to create task.");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const markTaskAsDone = async (taskId) => {
    clearMessage();
    setUpdatingTaskId(taskId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/tasks/${taskId}/status?status=DONE`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      await loadDashboard();
      showSuccess("Task marked as done.");
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to update task status.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const deleteTask = async (taskId) => {
    clearMessage();
    setDeletingTaskId(taskId);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      await loadDashboard();
      showSuccess("Task deleted successfully.");
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to delete task.");
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div className="app">
      <h1>StudyFlow</h1>
      <p className="subtitle">Smart academic planner dashboard</p>

      {message && (
        <div className={`alert alert-${message.type}`} role="alert">
          <span>{message.text}</span>
          <button className="alert-close-button" onClick={clearMessage}>
            X
          </button>
        </div>
      )}

      {isLoadingDashboard && (
        <p className="loading-message">Loading dashboard data...</p>
      )}

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

      <section className="course-progress-section">
        <h2>Course Progress</h2>

        {courseProgress.length === 0 && !isLoadingDashboard ? (
          <p>No course progress data yet.</p>
        ) : (
          <div className="course-progress-grid">
            {courseProgress.map((course) => {
              const completionPercentage = Number(
                course.completionPercentage ?? 0
              );

              return (
                <div className="course-progress-card" key={course.courseId}>
                  <h3>{course.courseName}</h3>

                  <p>
                    <strong>Total Tasks:</strong> {course.totalTasks}
                  </p>

                  <p>
                    <strong>Open Tasks:</strong> {course.openTasks}
                  </p>

                  <p>
                    <strong>Done Tasks:</strong> {course.doneTasks}
                  </p>

                  <p>
                    <strong>Remaining Hours:</strong>{" "}
                    {course.remainingEstimatedHours}
                  </p>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>

                  <p>{completionPercentage.toFixed(1)}% completed</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="form-section">
        <h2>Create New Course</h2>

        <form onSubmit={createCourse} className="task-form">
          <input
            name="name"
            placeholder="Course name"
            value={newCourse.name}
            onChange={handleCourseInputChange}
            disabled={isCreatingCourse}
            required
          />

          <input
            name="semester"
            placeholder="Semester"
            value={newCourse.semester}
            onChange={handleCourseInputChange}
            disabled={isCreatingCourse}
            required
          />

          <input
            name="difficulty"
            type="number"
            min="1"
            max="5"
            placeholder="Difficulty"
            value={newCourse.difficulty}
            onChange={handleCourseInputChange}
            disabled={isCreatingCourse}
            required
          />

          <button type="submit" disabled={isCreatingCourse}>
            {isCreatingCourse ? "Creating..." : "Create Course"}
          </button>
        </form>
      </section>

      <section className="form-section">
        <h2>Create New Task</h2>

        <form onSubmit={createTask} className="task-form">
          <input
            name="title"
            placeholder="Task title"
            value={newTask.title}
            onChange={handleTaskInputChange}
            disabled={isCreatingTask}
            required
          />

          <input
            name="description"
            placeholder="Description"
            value={newTask.description}
            onChange={handleTaskInputChange}
            disabled={isCreatingTask}
            required
          />

          <input
            name="deadline"
            type="date"
            value={newTask.deadline}
            onChange={handleTaskInputChange}
            disabled={isCreatingTask}
            required
          />

          <input
            name="estimatedHours"
            type="number"
            min="0.5"
            step="0.5"
            placeholder="Estimated hours"
            value={newTask.estimatedHours}
            onChange={handleTaskInputChange}
            disabled={isCreatingTask}
            required
          />

          <input
            name="priority"
            type="number"
            min="1"
            max="5"
            placeholder="Priority"
            value={newTask.priority}
            onChange={handleTaskInputChange}
            disabled={isCreatingTask}
            required
          />

          <select
            name="courseId"
            value={newTask.courseId}
            onChange={handleTaskInputChange}
            disabled={isCreatingTask}
            required
          >
            <option value="">Select course</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <button type="submit" disabled={isCreatingTask}>
            {isCreatingTask ? "Creating..." : "Create Task"}
          </button>
        </form>
      </section>

      <h2>Upcoming Open Tasks</h2>

      <div className="task-list">
        {tasks.length === 0 && !isLoadingDashboard ? (
          <p>No open tasks found.</p>
        ) : (
          tasks.map((task) => (
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
                <button
                  onClick={() => markTaskAsDone(task.id)}
                  disabled={updatingTaskId === task.id}
                >
                  {updatingTaskId === task.id ? "Updating..." : "Mark as Done"}
                </button>

                <button
                  className="delete-button"
                  onClick={() => deleteTask(task.id)}
                  disabled={deletingTaskId === task.id}
                >
                  {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
import { useCallback, useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

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
  const [taskPage, setTaskPage] = useState(0);
  const [taskSize, setTaskSize] = useState(10);
  const [totalTaskPages, setTotalTaskPages] = useState(1);
  const [totalTaskElements, setTotalTaskElements] = useState(0);

  const [message, setMessage] = useState(null);

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [updatingCourseId, setUpdatingCourseId] = useState(null);

  const [editCourseForm, setEditCourseForm] = useState({
    name: "",
    semester: "",
    difficulty: 3,
  });

  const [newCourse, setNewCourse] = useState({
    name: "",
    semester: "",
    difficulty: 3,
  });

  const [taskFilters, setTaskFilters] = useState({
    search: "",
    status: "",
    courseId: "",
    sortBy: "deadline",
    direction: "asc",
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

  const [editingTaskId, setEditingTaskId] = useState(null);

  const [editTaskForm, setEditTaskForm] = useState({
    title: "",
    description: "",
    deadline: "",
    estimatedHours: 1,
    priority: 3,
    status: "TODO",
    courseId: "",
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });

    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const showSuccess = (text) => {
    showMessage("success", text);
  };

  const showError = (text) => {
    showMessage("error", text);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  const loadDashboard = useCallback(async () => {
    setIsLoadingDashboard(true);

    try {
      const [summaryResponse, coursesResponse, progressResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/dashboard/summary`),
          fetch(`${API_BASE_URL}/courses`),
          fetch(`${API_BASE_URL}/dashboard/courses`),
        ]);

      if (!summaryResponse.ok) {
        throw new Error("Failed to load dashboard summary");
      }

      if (!coursesResponse.ok) {
        throw new Error("Failed to load courses");
      }

      if (!progressResponse.ok) {
        throw new Error("Failed to load course progress");
      }

      const summaryData = await summaryResponse.json();
      const coursesData = await coursesResponse.json();
      const progressData = await progressResponse.json();

      setSummary(summaryData);
      setCourses(coursesData);
      setCourseProgress(progressData);
    } catch (error) {
      console.error(error);
      showError("Could not load dashboard data. Make sure the backend is running.");
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  const loadTasks = useCallback(async () => {
      setIsLoadingTasks(true);

    try {
      const params = new URLSearchParams();

      params.append("page", taskPage.toString());
      params.append("size", taskSize.toString());

      if (taskFilters.search.trim()) {
        params.append("search", taskFilters.search.trim());
      }

      if (taskFilters.status) {
        params.append("status", taskFilters.status);
      }

      if (taskFilters.courseId) {
        params.append("courseId", taskFilters.courseId);
      }

      params.append("sortBy", taskFilters.sortBy);
      params.append("direction", taskFilters.direction);

      const response = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();

      const loadedTasks = data.content ?? data;

      setTotalTaskPages(data.totalPages ?? 1);
      setTotalTaskElements(data.totalElements ?? loadedTasks.length);

      setTasks(
        taskFilters.status
          ? loadedTasks
          : loadedTasks.filter((task) => task.status !== "DONE")
      );
      } catch (error) {
        console.error(error);
        showError("Could not load tasks.");
      } finally {
        setIsLoadingTasks(false);
      }
    }, [taskFilters, taskPage, taskSize]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCourseInputChange = (event) => {
    const { name, value } = event.target;

    setNewCourse({
      ...newCourse,
      [name]: value,
    });
  };

  const handleDeleteCourse = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) {
      return;
    }

    clearMessage();
    setDeletingCourseId(courseId);

    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      await loadDashboard();
      await loadTasks();

      showSuccess("Course deleted successfully.");
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to delete course.");
    } finally {
      setDeletingCourseId(null);
    }
  };

  const startEditingCourse = (course) => {
    setEditingCourseId(course.id);

    setEditCourseForm({
      name: course.name,
      semester: course.semester,
      difficulty: course.difficulty,
    });
  };

  const handleEditCourseInputChange = (event) => {
    const { name, value } = event.target;

    setEditCourseForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const cancelEditingCourse = () => {
    setEditingCourseId(null);

    setEditCourseForm({
      name: "",
      semester: "",
      difficulty: 3,
    });
  };

  const updateCourse = async (event) => {
    event.preventDefault();
    clearMessage();
    setUpdatingCourseId(editingCourseId);

    const courseToUpdate = {
      ...editCourseForm,
      difficulty: Number(editCourseForm.difficulty),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/courses/${editingCourseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseToUpdate),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      cancelEditingCourse();
      await loadDashboard();
      await loadTasks();

      showSuccess("Course updated successfully.");
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to update course.");
    } finally {
      setUpdatingCourseId(null);
    }
  };

  const handleTaskInputChange = (event) => {
    const { name, value } = event.target;

    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  const startEditingTask = (task) => {
    setEditingTaskId(task.id);

    setEditTaskForm({
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      estimatedHours: task.estimatedHours,
      priority: task.priority,
      status: task.status,
      courseId: task.courseId || "",
    });
  };

  const handleEditTaskInputChange = (event) => {
    const { name, value } = event.target;

    setEditTaskForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);

    setEditTaskForm({
      title: "",
      description: "",
      deadline: "",
      estimatedHours: 1,
      priority: 3,
      status: "TODO",
      courseId: "",
    });
  };

  const updateTask = async (event) => {
    event.preventDefault();
    clearMessage();
    setUpdatingTaskId(editingTaskId);

    const taskToUpdate = {
      ...editTaskForm,
      estimatedHours: Number(editTaskForm.estimatedHours),
      priority: Number(editTaskForm.priority),
      courseId: Number(editTaskForm.courseId),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${editingTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskToUpdate),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      cancelEditingTask();
      await loadDashboard();
      await loadTasks();
      showSuccess("Task updated successfully.");
    } catch (error) {
      console.error(error);
      showError(error.message || "Failed to update task.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleTaskFilterChange = (event) => {
    const { name, value } = event.target;

    setTaskPage(0);

    setTaskFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const goToPreviousTaskPage = () => {
    setTaskPage((previousPage) => Math.max(previousPage - 1, 0));
  };

  const goToNextTaskPage = () => {
    setTaskPage((previousPage) =>
      Math.min(previousPage + 1, totalTaskPages - 1)
    );
  };

  const handleTaskSizeChange = (event) => {
    setTaskPage(0);
    setTaskSize(Number(event.target.value));
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
      await loadTasks();
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
      await loadTasks();
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
      await loadTasks();
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
      <div className="hero">
        <div className="hero-label">Full Stack Portfolio Project</div>

        <h1>StudyFlow</h1>

        <p className="subtitle">
          Smart academic planner dashboard for courses, tasks, progress tracking,
          filters and study workload management.
        </p>

        <div className="hero-badges">
          <span>Spring Boot API</span>
          <span>React Frontend</span>
          <span>PostgreSQL</span>
          <span>Live Deployment</span>
        </div>
      </div>

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

      <section className="courses-section">
        <h2>Courses</h2>

        {courses.length === 0 && !isLoadingDashboard ? (
          <p>No courses found.</p>
        ) : (
          <div className="course-progress-grid">
            {courses.map((course) => (
              <div className="course-progress-card" key={course.id}>
                {editingCourseId === course.id ? (
                  <form onSubmit={updateCourse} className="edit-task-form">
                    <input
                      name="name"
                      placeholder="Course name"
                      value={editCourseForm.name}
                      onChange={handleEditCourseInputChange}
                      required
                    />

                    <input
                      name="semester"
                      placeholder="Semester"
                      value={editCourseForm.semester}
                      onChange={handleEditCourseInputChange}
                      required
                    />

                    <input
                      name="difficulty"
                      type="number"
                      min="1"
                      max="5"
                      value={editCourseForm.difficulty}
                      onChange={handleEditCourseInputChange}
                      required
                    />

                    <div className="task-actions">
                      <button type="submit" disabled={updatingCourseId === course.id}>
                        {updatingCourseId === course.id ? "Saving..." : "Save Changes"}
                      </button>

                      <button type="button" onClick={cancelEditingCourse}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{course.name}</h3>

                    <p>
                      <strong>Semester:</strong> {course.semester}
                    </p>

                    <p>
                      <strong>Difficulty:</strong> {course.difficulty}
                    </p>

                    <div className="task-actions">
                      <button type="button" onClick={() => startEditingCourse(course)}>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={deletingCourseId === course.id}
                      >
                        {deletingCourseId === course.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
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

      <section className="task-filters-section">
        <h2>Tasks</h2>

        <div className="task-filters">
          <input
            type="text"
            name="search"
            placeholder="Search tasks..."
            value={taskFilters.search}
            onChange={handleTaskFilterChange}
          />

          <select
            name="status"
            value={taskFilters.status}
            onChange={handleTaskFilterChange}
          >
            <option value="">Open tasks</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>

          <select
            name="courseId"
            value={taskFilters.courseId}
            onChange={handleTaskFilterChange}
          >
            <option value="">All courses</option>

            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          <select
            name="sortBy"
            value={taskFilters.sortBy}
            onChange={handleTaskFilterChange}
          >
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="estimatedHours">Estimated Hours</option>
            <option value="title">Title</option>
          </select>

          <select
            name="direction"
            value={taskFilters.direction}
            onChange={handleTaskFilterChange}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div className="task-actions">
          <button
            type="button"
            onClick={goToPreviousTaskPage}
            disabled={isLoadingTasks || taskPage === 0}
          >
            Previous
          </button>

          <span>
            Page {taskPage + 1} of {totalTaskPages} | Total tasks:{" "}
            {totalTaskElements}
          </span>

          <button
            type="button"
            onClick={goToNextTaskPage}
            disabled={isLoadingTasks || taskPage + 1 >= totalTaskPages}
          >
            Next
          </button>

          <select value={taskSize} onChange={handleTaskSizeChange} disabled={isLoadingTasks}>
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </section>

      {isLoadingTasks && (
        <p className="loading-message">Loading tasks...</p>
      )}

      <div className="task-list">
        {tasks.length === 0 && !isLoadingTasks ? (
          <p>No tasks found.</p>
        ) : (
          tasks.map((task) => (
            <div className="task-card" key={task.id}>
              {editingTaskId === task.id ? (
                <form onSubmit={updateTask} className="edit-task-form">
                  <input
                    name="title"
                    placeholder="Task title"
                    value={editTaskForm.title}
                    onChange={handleEditTaskInputChange}
                    required
                  />

                  <input
                    name="description"
                    placeholder="Description"
                    value={editTaskForm.description}
                    onChange={handleEditTaskInputChange}
                    required
                  />

                  <input
                    name="deadline"
                    type="date"
                    value={editTaskForm.deadline}
                    onChange={handleEditTaskInputChange}
                    required
                  />

                  <input
                    name="estimatedHours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={editTaskForm.estimatedHours}
                    onChange={handleEditTaskInputChange}
                    required
                  />

                  <input
                    name="priority"
                    type="number"
                    min="1"
                    max="5"
                    value={editTaskForm.priority}
                    onChange={handleEditTaskInputChange}
                    required
                  />

                  <select
                    name="status"
                    value={editTaskForm.status}
                    onChange={handleEditTaskInputChange}
                    required
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>

                  <select
                    name="courseId"
                    value={editTaskForm.courseId}
                    onChange={handleEditTaskInputChange}
                    required
                  >
                    <option value="">Select course</option>

                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>

                  <div className="task-actions">
                    <button type="submit" disabled={updatingTaskId === task.id}>
                      {updatingTaskId === task.id ? "Saving..." : "Save Changes"}
                    </button>

                    <button type="button" onClick={cancelEditingTask}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
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

                  <p>
                    <strong>Estimated Hours:</strong> {task.estimatedHours}
                  </p>

                  <p>
                    <strong>Priority:</strong> {task.priority}
                  </p>

                  <div className="task-actions">
                    <button onClick={() => startEditingTask(task)}>Edit</button>

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
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
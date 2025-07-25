import { useState, useEffect } from "react";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = "http://localhost:5000";

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      fetchTaskDetails(selectedTaskId);
    } else {
      setSelectedTask(null);
    }
  }, [selectedTaskId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get_tasks?page=1&limit=50`);
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
    setLoading(false);
  };

  const fetchTaskDetails = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/get_task/${taskId}`);
      const data = await res.json();
      setSelectedTask(data);
    } catch (err) {
      console.error("Error fetching task details:", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div style={{ flex: 1 }}>
        <h2>Task List</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((task) => (
              <li
                key={task.task_id}
                style={{
                  cursor: "pointer",
                  padding: "8px",
                  border: selectedTaskId === task.task_id ? "2px solid blue" : "1px solid gray",
                  marginBottom: "6px",
                  borderRadius: "4px",
                  backgroundColor: selectedTaskId === task.task_id ? "#e0e7ff" : "white",
                }}
                onClick={() => setSelectedTaskId(task.task_id)}
              >
                {task.task_type} - {task.task_id.slice(0, 8)}...
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ flex: 2 }}>
        <h2>Task Details</h2>
        {selectedTask ? (
          <div>
            <p><strong>ID:</strong> {selectedTask.task_id}</p>
            <p><strong>Type:</strong> {selectedTask.task_type}</p>
            <p><strong>Status:</strong> {selectedTask.status}</p>
            <p><strong>Data:</strong> {selectedTask.task_data}</p>
            <p><strong>Result:</strong></p>
            <pre style={{ maxHeight: "300px", overflowY: "auto", backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "4px" }}>
              {selectedTask.result || "No result yet"}
            </pre>
          </div>
        ) : (
          <p>Please select a task to see details.</p>
        )}
      </div>
    </div>
  );
}


import { useState } from "react";

export default function AddTask({ onTaskAdded }) {
  const [taskType, setTaskType] = useState("");
  const [taskData, setTaskData] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:5000";

  const addTask = async () => {
    setError("");
    if (!taskType) {
      setError("Please select a task type.");
      return;
    }
    if (!taskData.trim()) {
      setError("Please enter task data.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/add_task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_type: taskType, task_data: taskData }),
      });
      const data = await res.json();
      if (data.task_id) {
        onTaskAdded(data.task_id);
        setTaskData("");
        setTaskType("");
      } else {
        setError("Failed to add task. Please try again.");
      }
    } catch (err) {
      setError("Error adding task: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Add Task</h2>
      <select
        value={taskType}
        onChange={(e) => setTaskType(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        disabled={loading}
      >
        <option value="">Select Task Type</option>
        <option value="ping">Ping</option>
        <option value="dns_lookup">DNS Lookup</option>
        <option value="katana">Katana</option>
        <option value="online_word_count">Online Word Count</option>
        <option value="command">Command</option>
        <option value="http_get">HTTP GET</option>
      </select>
      <textarea
        placeholder="Enter task data here"
        value={taskData}
        onChange={(e) => setTaskData(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: "8px" }}
        disabled={loading}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        onClick={addTask}
        style={{ marginTop: "10px", padding: "10px 20px" }}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Task"}
      </button>
    </div>
  );
}


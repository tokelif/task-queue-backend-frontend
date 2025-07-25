import { useState, useEffect } from "react";

function TaskStatus({ taskId }) {
  const [taskInfo, setTaskInfo] = useState(null);

  useEffect(() => {
    if (!taskId) {
      setTaskInfo(null);
      return;
    }

    const fetchTask = async () => {
      try {
        const res = await fetch(`http://localhost:5000/get_task/${taskId}`);
        const data = await res.json();
        setTaskInfo(data.error ? null : data);
      } catch {
        setTaskInfo(null);
      }
    };

    fetchTask();

    // 3 saniyede bir güncelle
    const interval = setInterval(fetchTask, 3000);

    // Cleanup
    return () => clearInterval(interval);
  }, [taskId]);

  if (!taskId) return null;

  return (
    <div style={{ whiteSpace: "pre-wrap", backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "6px" }}>
      <h3>Task Info (ID: {taskId})</h3>
      {taskInfo ? (
        <>
          <p><strong>Status:</strong> {taskInfo.status}</p>
          <p><strong>Result:</strong></p>
          <pre>{taskInfo.result || "No result yet"}</pre>
        </>
      ) : (
        <p>Task not found or no result yet.</p>
      )}
    </div>
  );
}

export default TaskStatus;


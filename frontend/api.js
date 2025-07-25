const API_BASE = "http://localhost:5000";

export async function addTask(taskType, taskData) {
  const response = await fetch(`${API_BASE}/add_task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_type: taskType, task_data: taskData }),
  });
  return await response.json();
}

export async function getTask(taskId) {
  const response = await fetch(`${API_BASE}/get_task/${taskId}`);
  return await response.json();
}

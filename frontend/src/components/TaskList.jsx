import React, { useState, useEffect } from "react";

export default function TaskList({ onSelectTask }) {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`http://localhost:5000/get_tasks?page=${page}&limit=10`)
      .then(res => res.json())
      .then(data => {
        setTasks(data.tasks);
        setTotalPages(Math.ceil(data.total / data.limit));
      })
      .catch(err => console.error("Error fetching tasks:", err));
  }, [page]);

  return (
    <div>
      <h3>Task List</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {tasks.map(task => (
          <li key={task.task_id}>
            <button
              style={{ margin: "4px", padding: "6px 12px" }}
              onClick={() => onSelectTask(task)}
            >
              {task.task_type} - {task.task_id.substring(0, 8)}
            </button>
          </li>
        ))}
      </ul>

      <div>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
          Previous
        </button>
        <span> Page {page} of {totalPages} </span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}


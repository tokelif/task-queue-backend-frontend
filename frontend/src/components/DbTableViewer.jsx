function DbTableViewer() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/get_tasks?page=1&limit=100`);
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch {
        setTasks([]);
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  return (
    <div style={{overflowX: "auto"}}>
      <h2>Database Task Table</h2>
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
          <thead>
            <tr>
              <th style={{border: "1px solid #ccc", padding: "8px"}}>Task ID</th>
              <th style={{border: "1px solid #ccc", padding: "8px"}}>Type</th>
              <th style={{border: "1px solid #ccc", padding: "8px"}}>Data</th>
              <th style={{border: "1px solid #ccc", padding: "8px"}}>Status</th>
              <th style={{border: "1px solid #ccc", padding: "8px"}}>Result</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: "center", padding: "8px"}}>No tasks found</td></tr>
            ) : (
              tasks.map(task => (
                <tr key={task.task_id}>
                  <td style={{border: "1px solid #ccc", padding: "8px", wordBreak: "break-word", maxWidth: "150px"}}>{task.task_id}</td>
                  <td style={{border: "1px solid #ccc", padding: "8px"}}>{task.task_type}</td>
                  <td style={{border: "1px solid #ccc", padding: "8px", wordBreak: "break-word", maxWidth: "200px"}}>{task.task_data}</td>
                  <td style={{border: "1px solid #ccc", padding: "8px"}}>{task.status}</td>
                  <td style={{border: "1px solid #ccc", padding: "8px", maxHeight: "150px", overflowY: "auto", whiteSpace: "pre-wrap"}}>
                    {task.result || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}


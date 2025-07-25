import { useState, useEffect } from "react";
import './App.css';

const API_BASE = "http://localhost:5000";

// CLOCK
function ClockGreeting() {
  const [time, setTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) setGreeting("Good Morning");
      else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
      else if (hour >= 17 && hour < 23) setGreeting("Good Evening");
      else setGreeting("Good Night");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="clock-greeting">
      <div className="time">{time.toLocaleTimeString('tr-TR')}</div>
      <div className="greeting">{greeting}</div>
    </div>
  );
}

// Task Status
function TaskStatusDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/get_tasks?page=1&limit=5`);
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error('Task fetch error:', err);
      }
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const getStatusCount = (status) => tasks.filter(t => t.status === status).length;

  if (loading) return <div className="loading">Loading stats...</div>;

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Task Status</h3>
        <div className="stat-values">
          <div>Completed: {getStatusCount('completed')}</div>
          <div>Pending: {getStatusCount('pending')}</div>
          <div>Failed: {getStatusCount('failed')}</div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Task Manager
function AddTask({ onTaskAdded }) {
  const [taskType, setTaskType] = useState("");
  const [taskData, setTaskData] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const taskTypes = [
    { value: "ping", label: "Ping", description: "Test network connectivity" },
    { value: "dns_lookup", label: "DNS Lookup", description: "Resolve domain names" },
    { value: "katana", label: "Web Crawler", description: "Crawl website and extract URLs" },
    { value: "online_word_count", label: "Word Count", description: "Count words on a webpage" },
    { value: "command", label: "System Command", description: "Execute system commands" },
    { value: "http_get", label: "HTTP GET", description: "Make HTTP GET request" }
  ];

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
        setTaskType("");
        setTaskData("");
      } else {
        setError("Failed to add task. Please try again.");
      }
    } catch (err) {
      setError("Error adding task: " + err.message);
    }
    setLoading(false);
  };

  const selectedTask = taskTypes.find(t => t.value === taskType);

  return (
    <div className="card">
      <h2>Create New Task</h2>
      <div className="form-group">
        <label>Task Type</label>
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          disabled={loading}
        >
          <option value="">Select Task Type</option>
          {taskTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {selectedTask && (
          <small className="task-description">{selectedTask.description}</small>
        )}
      </div>
      <div className="form-group">
        <label>Task Data</label>
        <textarea
          placeholder={
            taskType === 'ping' ? 'e.g., google.com' :
            taskType === 'dns_lookup' ? 'e.g., example.com' :
            taskType === 'katana' ? 'e.g., https://example.com' :
            taskType === 'online_word_count' ? 'e.g., {"url": "https://example.com", "word": "test"}' :
            taskType === 'command' ? 'e.g., ls -la' :
            taskType === 'http_get' ? 'e.g., https://api.github.com' :
            'Enter task data here'
          }
          value={taskData}
          onChange={(e) => setTaskData(e.target.value)}
          rows={4}
          disabled={loading}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button className="primary" onClick={addTask} disabled={loading}>
        {loading ? "Creating Task..." : "Create Task"}
      </button>
    </div>
  );
}

// Enhanced Task Status
function TaskStatus({ taskId }) {
  const [taskInfo, setTaskInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setTaskInfo(null);
      return;
    }

    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/get_task/${taskId}`);
        const data = await res.json();
        setTaskInfo(data.error ? null : data);
      } catch {
        setTaskInfo(null);
      }
      setLoading(false);
    };

    fetchTask();
    const interval = setInterval(() => {
      if (taskInfo?.status === 'running' || taskInfo?.status === 'pending') fetchTask();
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, taskInfo?.status]);

  if (!taskId) return null;

  return (
    <div className="card">
      <h3>Task Status (ID: {taskId})</h3>
      {loading ? (
        <div className="loading">Loading task details...</div>
      ) : taskInfo ? (
        <div className="task-details">
          <div className="status-badge">
            <span className={`status ${taskInfo.status}`}>
              {taskInfo.status.toUpperCase()}
            </span>
          </div>
          <div className="task-meta">
            <p><strong>Type:</strong> {taskInfo.task_type}</p>
            <p><strong>Data:</strong> {taskInfo.task_data}</p>
            <p><strong>Created:</strong> {new Date(taskInfo.created_at).toLocaleString()}</p>
            {taskInfo.completed_at && (
              <p><strong>Completed:</strong> {new Date(taskInfo.completed_at).toLocaleString()}</p>
            )}
          </div>
          {taskInfo.result && (
            <div className="task-result">
              <strong>Result:</strong>
              <pre className="result-output">{taskInfo.result}</pre>
            </div>
          )}
        </div>
      ) : (
        <p className="error">Task not found or failed to load.</p>
      )}
    </div>
  );
}

// Enhanced Task Table with filtering FRONTEND
function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      const res = await fetch(`${API_BASE}/get_tasks?${params}`);
      const data = await res.json();
      let filteredTasks = data.tasks || [];
      if (filters.search) {
        filteredTasks = filteredTasks.filter(t =>
          t.task_id.includes(filters.search) || t.task_data.includes(filters.search)
        );
      }
      if (filters.type) filteredTasks = filteredTasks.filter(t => t.task_type === filters.type);
      if (filters.status) filteredTasks = filteredTasks.filter(t => t.status === filters.status);
      setTasks(filteredTasks);
      setTotalPages(data.total ? Math.ceil(data.total / 20) : 1);
    } catch (err) {
      console.error('Tasks fetch error:', err);
      setTasks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [page, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="card">
      <div className="table-header">
        <h2>Task History</h2>
        <button onClick={fetchTasks} className="refresh-btn">Refresh</button>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="ping">Ping</option>
          <option value="dns_lookup">DNS Lookup</option>
          <option value="katana">Web Crawler</option>
          <option value="online_word_count">Word Count</option>
          <option value="command">Command</option>
          <option value="http_get">HTTP GET</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Result Preview</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan="6">No tasks found</td></tr>
                ) : (
                  tasks.map(task => (
                    <tr key={task.task_id}>
                      <td><code className="task-id">{task.task_id}</code></td>
                      <td><span className="task-type">{task.task_type}</span></td>
                      <td>
                        <div className="task-data" title={task.task_data}>
                          {task.task_data.length > 30 ? task.task_data.substring(0, 30) + '...' : task.task_data}
                        </div>
                      </td>
                      <td><span className={`status ${task.status}`}>{task.status}</span></td>
                      <td>
                        <div className="date">
                          {new Date(task.created_at).toLocaleDateString()}
                          <br /><small>{new Date(task.created_at).toLocaleTimeString()}</small>
                        </div>
                      </td>
                      <td>
                        <div className="result-preview">
                          {task.result ? (
                            <pre>{task.result.substring(0, 100)}...</pre>
                          ) : (
                            <span className="no-result">No result</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

// Crawler History Bileşeni
function CrawlerHistory() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      const res = await fetch(`${API_BASE}/get_tasks?${params}`);
      const data = await res.json();
      const katanaTasks = (data.tasks || []).filter(t => t.task_type === 'katana');
      setTasks(katanaTasks);
      setTotalPages(data.total ? Math.ceil(data.total / 20) : 1);
    } catch (err) {
      console.error('Tasks fetch error:', err);
      setTasks([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [page]);

  return (
    <div className="card">
      <div className="table-header">
        <h2>Crawler History</h2>
        <button onClick={fetchTasks} className="refresh-btn">Refresh</button>
      </div>
      {loading ? (
        <div className="loading">Loading crawler history...</div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data (URL)</th>
                  <th>Status</th>
                  <th>Result</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan="5">No crawler tasks found</td></tr>
                ) : (
                  tasks.map(task => (
                    <tr key={task.task_id}>
                      <td><code className="task-id">{task.task_id}</code></td>
                      <td>{task.task_data}</td>
                      <td><span className={`status ${task.status}`}>{task.status}</span></td>
                      <td>
                        <div className="result-preview">
                          {task.result ? <pre>{task.result.substring(0, 100)}...</pre> : <span className="no-result">No result</span>}
                        </div>
                      </td>
                      <td>
                        <div className="date">
                          {new Date(task.created_at).toLocaleDateString()}
                          <br /><small>{new Date(task.created_at).toLocaleTimeString()}</small>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

// URL Results Bileşeni
function URLResults() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      const res = await fetch(`${API_BASE}/get_tasks?${params}`);
      const data = await res.json();
      const katanaTasks = (data.tasks || []).filter(t => t.task_type === 'katana' && t.result);
      let allUrls = [];
      katanaTasks.forEach(task => {
        const resultLines = task.result.split('\n').filter(line => line.trim() && line.includes('http'));
        allUrls = allUrls.concat(resultLines.map(line => ({
          task_id: task.task_id,
          url: line.trim(),
          created_at: task.created_at
        })));
      });
      setUrls(allUrls);
      setTotalPages(Math.ceil(allUrls.length / 20));
    } catch (err) {
      console.error('Tasks fetch error:', err);
      setUrls([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [page]);

  return (
    <div className="card">
      <div className="table-header">
        <h2>Discovered URLs</h2>
        <button onClick={fetchTasks} className="refresh-btn">Refresh</button>
      </div>
      {loading ? (
        <div className="loading">Loading URLs...</div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>URL</th>
                  <th>Discovered</th>
                </tr>
              </thead>
              <tbody>
                {urls.length === 0 ? (
                  <tr><td colSpan="3">No URLs found</td></tr>
                ) : (
                  urls.slice((page - 1) * 20, page * 20).map((url, index) => (
                    <tr key={index}>
                      <td><code className="task-id">{url.task_id}</code></td>
                      <td>
                        <a href={url.url} target="_blank" rel="noopener noreferrer">
                          {url.url.length > 50 ? url.url.substring(0, 50) + '...' : url.url}
                        </a>
                      </td>
                      <td>
                        <div className="date">
                          {new Date(url.created_at).toLocaleDateString()}
                          <br /><small>{new Date(url.created_at).toLocaleTimeString()}</small>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState("tasks");
  const [lastTaskId, setLastTaskId] = useState("");

  const pages = [
    { id: "tasks", label: "Task Manager" },
    { id: "dashboard", label: "Dashboard" },
    { id: "history", label: "Task History" },
    { id: "crawler", label: "Crawler History" },
    { id: "urls", label: "URL Results" }
  ];

  return (
    <>
      <ClockGreeting />
      <div className="main-container">
        <nav>
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              disabled={currentPage === page.id}
              className={currentPage === page.id ? 'active' : ''}
            >
              {page.label}
            </button>
          ))}
        </nav>
        <div className="content">
          {currentPage === "tasks" && (
            <>
              <h1>Task Manager</h1>
              <AddTask onTaskAdded={setLastTaskId} />
              <TaskStatus taskId={lastTaskId} />
            </>
          )}
          {currentPage === "dashboard" && (
            <>
              <h1>Task Manager Dashboard</h1>
              <TaskStatusDashboard />
            </>
          )}
          {currentPage === "history" && (
            <>
              <h1>Task History</h1>
              <TaskTable />
            </>
          )}
          {currentPage === "crawler" && (
            <>
              <h1>Crawler History</h1>
              <CrawlerHistory />
            </>
          )}
          {currentPage === "urls" && (
            <>
              <h1>Discovered URLs</h1>
              <URLResults />
            </>
          )}
        </div>
      </div>
    </>
  );
}

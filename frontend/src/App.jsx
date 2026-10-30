import { useEffect, useMemo, useState } from "react";
import api from "./api";

const today = new Date().toISOString().slice(0, 10);
const emptyTask = { title: "", subject: "", dueDate: today, priority: "Medium", notes: "" };

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ssp_user") || "null"); } catch { return null; }
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTasks() {
    try { const { data } = await api.get("/tasks"); setTasks(data); }
    catch (e) { setError(e.response?.data?.message || "Unable to load tasks. Is the backend running?"); }
  }
  useEffect(() => { if (user) loadTasks(); }, [user]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate.slice(0, 10) < today).length
  }), [tasks]);

  const visibleTasks = useMemo(() => tasks.filter(t => {
    const matchesFilter = filter === "All" || (filter === "Completed" ? t.completed : !t.completed);
    const matchesSearch = `${t.title} ${t.subject}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [tasks, filter, search]);

  async function authenticate(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, authForm);
      localStorage.setItem("ssp_token", data.token);
      localStorage.setItem("ssp_user", JSON.stringify(data.user));
      setUser(data.user); setMessage(`Welcome${data.user.name ? `, ${data.user.name}` : ""}!`);
    } catch (e) { setError(e.response?.data?.message || "Could not connect to the server."); }
    finally { setLoading(false); }
  }

  function logout() {
    localStorage.removeItem("ssp_token"); localStorage.removeItem("ssp_user");
    setUser(null); setTasks([]); setMessage(""); setError("");
  }

  async function saveTask(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      if (editingId) await api.put(`/tasks/${editingId}`, form);
      else await api.post("/tasks", form);
      setForm(emptyTask); setEditingId(null); setMessage(editingId ? "Task updated." : "Task added to your plan.");
      await loadTasks();
    } catch (e) { setError(e.response?.data?.message || "Could not save task."); }
  }

  function editTask(task) {
    setEditingId(task._id);
    setForm({ title: task.title, subject: task.subject, dueDate: task.dueDate.slice(0, 10), priority: task.priority, notes: task.notes || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleTask(task) {
    try { await api.put(`/tasks/${task._id}`, { completed: !task.completed }); await loadTasks(); }
    catch (e) { setError(e.response?.data?.message || "Could not update task."); }
  }

  async function deleteTask(id) {
    if (!window.confirm("Delete this study task?")) return;
    try { await api.delete(`/tasks/${id}`); setTasks(prev => prev.filter(t => t._id !== id)); setMessage("Task deleted."); }
    catch (e) { setError(e.response?.data?.message || "Could not delete task."); }
  }

  if (!user) return <main className="auth-shell">
    <section className="auth-art">
      <div className="brand"><span className="brand-icon">✦</span> StudySpace</div>
      <div className="art-copy"><span className="eyebrow">YOUR PERSONAL STUDY COMPANION</span><h1>Small steps.<br/>Big achievements.</h1><p>Organize your learning, keep track of deadlines, and make every study session count.</p>
        <div className="mini-card"><span className="mini-check">✓</span><div><b>Stay on track</b><small>One clear plan for every subject</small></div><span className="sparkle">✦</span></div>
      </div><div className="art-footer">Plan with purpose · Learn with confidence</div>
    </section>
    <section className="auth-panel"><form className="auth-form" onSubmit={authenticate}>
      <div className="mobile-brand"><span className="brand-icon">✦</span> StudySpace</div>
      <span className="eyebrow">{authMode === "login" ? "WELCOME BACK" : "GET STARTED"}</span>
      <h2>{authMode === "login" ? "Sign in to your planner" : "Create your account"}</h2>
      <p className="muted">{authMode === "login" ? "Pick up where you left off." : "Build a better study routine, starting today."}</p>
      {authMode === "register" && <label>Full name<input required value={authForm.name} onChange={e => setAuthForm({...authForm, name:e.target.value})} placeholder="Your name"/></label>}
      <label>Email address<input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email:e.target.value})} placeholder="you@example.com"/></label>
      <label>Password<input required minLength="6" type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password:e.target.value})} placeholder="At least 6 characters"/></label>
      {error && <div className="alert error">{error}</div>}
      <button className="primary full" disabled={loading}>{loading ? "Please wait…" : authMode === "login" ? "Sign in →" : "Create account →"}</button>
      <p className="switch-auth">{authMode === "login" ? "New to StudySpace?" : "Already have an account?"} <button type="button" className="text-button" onClick={() => {setAuthMode(authMode === "login" ? "register" : "login"); setError("");}}> {authMode === "login" ? "Create an account" : "Sign in"}</button></p>
      <p className="fine-print">Your study plan, all in one place.</p>
    </form></section>
  </main>;

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-icon">✦</span> StudySpace</div><div className="side-label">WORKSPACE</div><div className="side-link active"><span>▦</span> Overview</div><div className="side-link"><span>✓</span> My study tasks</div><div className="side-bottom"><div className="avatar">{(user.name || user.email).slice(0,1).toUpperCase()}</div><div className="profile-copy"><b>{user.name || "Student"}</b><small>{user.email}</small></div><button className="icon-button" title="Sign out" onClick={logout}>↪</button></div></aside>
    <main className="main-content"><header className="topbar"><div><span className="eyebrow">STUDENT WORKSPACE</span><h2>Your study overview</h2></div><div className="top-actions"><span className="today-label">◷ {new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span><div className="avatar small">{(user.name || user.email).slice(0,1).toUpperCase()}</div></div></header>
      <section className="welcome-banner"><div><span className="banner-label">A LITTLE PROGRESS EVERY DAY</span><h1>Let's make today count{user.name ? `, ${user.name.split(" ")[0]}` : ""}. <span>✦</span></h1><p>Keep your goals in sight. You've got this.</p></div><div className="banner-illustration"><div className="sun">✦</div><div className="book book-one"></div><div className="book book-two"></div><div className="book book-three"></div></div></section>
      {message && <div className="alert success">{message}<button onClick={() => setMessage("")}>×</button></div>}
      {error && <div className="alert error">{error}<button onClick={() => setError("")}>×</button></div>}
      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><span>Total tasks</span><span className="stat-icon lilac">▦</span></div><strong>{stats.total}</strong><small>All your study goals</small></div>
        <div className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-icon mint">✓</span></div><strong>{stats.completed}</strong><small>Great work so far</small></div>
        <div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon peach">◷</span></div><strong>{stats.pending}</strong><small>Keep moving forward</small></div>
        <div className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-icon rose">!</span></div><strong>{stats.overdue}</strong><small>Tasks past their due date</small></div>
      </section>
      <div className="content-grid">
        <section className="panel task-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR PLAN</span><h3>{editingId ? "Update study task" : "Add a study task"}</h3></div><span className="heading-mark">✎</span></div>
          <form onSubmit={saveTask} className="task-form">
            <label>Task title<input required maxLength="120" value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="e.g. Revise sorting algorithms"/></label>
            <div className="form-row"><label>Subject<input required value={form.subject} onChange={e => setForm({...form,subject:e.target.value})} placeholder="e.g. Data Structures"/></label><label>Due date<input required type="date" value={form.dueDate} onChange={e => setForm({...form,dueDate:e.target.value})}/></label></div>
            <label>Priority<select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label>
            <label>Notes <span className="optional">(optional)</span><textarea rows="2" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} placeholder="Add a reminder or a few details…"/></label>
            <div className="form-actions">{editingId && <button type="button" className="secondary" onClick={() => {setEditingId(null);setForm(emptyTask);}}>Cancel</button>}<button className="primary" type="submit">{editingId ? "Save changes" : "+ Add task"}</button></div>
          </form>
        </section>
        <section className="panel list-panel"><div className="panel-heading"><div><span className="eyebrow">STAY ORGANIZED</span><h3>Your study tasks <span className="count">{tasks.length}</span></h3></div></div>
          <div className="list-tools"><input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="⌕  Search tasks or subjects…"/><div className="filter-tabs">{["All","Pending","Completed"].map(f => <button key={f} className={filter===f?"selected":""} onClick={() => setFilter(f)}>{f}</button>)}</div></div>
          <div className="task-list">{visibleTasks.length === 0 ? <div className="empty-state"><div className="empty-icon">✧</div><b>{tasks.length ? "No matching tasks" : "Your plan starts here"}</b><p>{tasks.length ? "Try another search or filter." : "Add your first study task to get organized."}</p></div> : visibleTasks.map(task => <article className={`task-item ${task.completed ? "is-complete" : ""}`} key={task._id}>
            <button className={`check-circle ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task)} title={task.completed ? "Mark pending" : "Mark complete"}>{task.completed ? "✓" : ""}</button>
            <div className="task-info"><b>{task.title}</b><div className="task-meta"><span>{task.subject}</span><span>·</span><span>Due {new Date(`${task.dueDate.slice(0,10)}T00:00:00`).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</span></div>{task.notes && <p className="task-notes">{task.notes}</p>}</div>
            <div className="task-end"><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><div className="task-buttons"><button title="Edit task" onClick={() => editTask(task)}>✎</button><button title="Delete task" onClick={() => deleteTask(task._id)}>×</button></div></div>
          </article>)}</div>
          <div className="list-footer"><span>Showing {visibleTasks.length} of {tasks.length} tasks</span><span>{stats.completed}/{stats.total} complete</span></div>
        </section>
      </div>
      <footer className="footer">Made for your next big achievement <span>✦</span></footer>
    </main>
  </div>;
}

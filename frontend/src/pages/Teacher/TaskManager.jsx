import { useState, useEffect } from 'react';
import api from '../../api/client';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{message}</div>;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchTasks(); }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/class/1');
      setTasks(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setCreating(true);
    try {
      await api.post('/tasks/', { title: newTaskTitle, class_id: 1 });
      setNewTaskTitle('');
      showToast('Task created!', 'success');
      fetchTasks();
    } catch (err) { showToast('Failed to create task', 'error'); }
    setCreating(false);
  };

  const toggleStatus = async (taskId, studentId, currentStatus) => {
    const next = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await api.post('/tasks/status', { task_id: taskId, student_id: studentId, status: next });
      fetchTasks();
    } catch (err) { showToast('Update failed', 'error'); }
  };

  const getRate = (students) => {
    if (!students.length) return 0;
    return Math.round((students.filter(s => s.status === 'completed').length / students.length) * 100);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h2>Tasks</h2>
        <p>Create and track assignments for Class 6A</p>
      </div>

      {/* Create */}
      <div className="glass" style={{ padding: 24, marginBottom: 28 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>New Task</h3>
        <form onSubmit={createTask} style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            placeholder="What do students need to do?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={creating} style={{ minWidth: 120 }}>
            {creating ? 'Adding...' : '+ Add'}
          </button>
        </form>
      </div>

      {tasks.length === 0 && (
        <div className="glass" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📝</p>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No tasks yet. Create one above!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {tasks.map((task, idx) => {
          const rate = getRate(task.students);
          return (
            <div key={task.task_id} className="glass animate-slide-up" style={{ padding: 28, animationDelay: `${idx * 0.08}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{task.title}</h3>
                  {task.due_date && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                      Due {task.due_date}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: rate === 100 ? 'var(--success)' : 'var(--accent)' }}>
                    {rate}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Completed
                  </div>
                </div>
              </div>

              <div className="progress-track" style={{ marginBottom: 24 }}>
                <div className="progress-fill" style={{
                  width: `${rate}%`,
                  background: rate === 100 ? 'var(--success)' : 'var(--accent-gradient)'
                }} />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th style={{ width: 140, textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.students.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => toggleStatus(task.task_id, s.id, s.status)}
                            className="pill"
                            style={{
                              background: s.status === 'completed' ? 'var(--success-light)' : 'var(--danger-light)',
                              color: s.status === 'completed' ? '#047857' : '#b91c1c',
                              minWidth: 110
                            }}
                          >
                            {s.status === 'completed' ? '✓ Done' : '○ Pending'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
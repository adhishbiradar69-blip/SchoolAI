import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{message}</div>;
}

export default function TaskManager() {
  const { user } = useAuth();
  const classId = user?.assigned_class_id;

  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchTasks();
      fetchSubjects();
    }
  }, [classId]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks/class/${classId}`);
      setTasks(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/tasks/subjects');
      setSubjects(res.data);
      if (res.data.length > 0) setSelectedSubject(String(res.data[0].id));
    } catch (err) { console.error(err); }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      showToast('Please enter a task name', 'error');
      return;
    }
    if (!selectedSubject) {
      showToast('Please select a subject', 'error');
      return;
    }
    setCreating(true);
    try {
      await api.post('/tasks/', {
        title: taskTitle,
        due_date: dueDate || null,
        class_id: classId,
        subject_id: parseInt(selectedSubject)
      });
      setTaskTitle('');
      setDueDate('');
      setShowModal(false);
      showToast('Task created!', 'success');
      fetchTasks();
    } catch (err) {
      showToast('Failed to create task', 'error');
    }
    setCreating(false);
  };

  const toggleStatus = async (taskId, studentId, currentStatus) => {
    const next = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await api.post('/tasks/status', { task_id: taskId, student_id: studentId, status: next });
      fetchTasks();
    } catch (err) { showToast('Update failed', 'error'); }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      showToast('Task deleted', 'success');
      fetchTasks();
      if (expandedTask === taskId) setExpandedTask(null);
    } catch (err) { showToast('Delete failed', 'error'); }
  };

  const getRate = (students) => {
    if (!students.length) return 0;
    return Math.round((students.filter(s => s.status === 'completed').length / students.length) * 100);
  };

  const getStatusStyle = (status) => {
    if (status === 'completed') return { bg: '#d1fae5', color: '#047857', border: '#10b981', label: '✓ Done' };
    if (status === 'late') return { bg: '#fee2e2', color: '#b91c1c', border: '#ef4444', label: '✗ Late' };
    return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: '○ Pending' };
  };

  if (!classId) {
    return (
      <div className="animate-fade" style={{ padding: 40 }}>
        <div className="glass" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
          <h3 style={{ fontSize: 20, fontWeight: 700 }}>No Class Assigned</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Contact administrator.</p>
        </div>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
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
        <p>Assignments for your class</p>
      </div>

      <div style={{ marginBottom: 28 }}>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '12px 28px' }}>
          + New Task
        </button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(248, 250, 252, 0.94)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }} onClick={() => setShowModal(false)}>
          <div className="glass animate-scale" style={{ padding: 32, width: '100%', maxWidth: 440, margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Create New Task</h3>
            <form onSubmit={createTask}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Task Name</label>
                <input type="text" placeholder="e.g., Chapter 5 Exercise" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="input" required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Subject</label>
                {subjects.length === 0 ? (
                  <p style={{ color: '#ef4444', fontSize: 13, fontWeight: 500 }}>
                    No subjects found. Run <b>Seed Data</b> from Admin first.
                  </p>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {subjects.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubject(String(sub.id))}
                        style={{
                          padding: '8px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                          background: selectedSubject === String(sub.id) ? sub.color : 'rgba(255,255,255,0.45)',
                          color: selectedSubject === String(sub.id) ? 'white' : '#64748b',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input" style={{ width: 'auto' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating} style={{ flex: 1 }}>{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="glass" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📝</p>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No tasks yet. Create one above!</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tasks.map((task) => {
          const rate = getRate(task.students);
          const isExpanded = expandedTask === task.task_id;
          return (
            <div key={task.task_id} className="glass animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                onClick={() => setExpandedTask(isExpanded ? null : task.task_id)}
                style={{
                  padding: '20px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `4px solid ${task.subject.color}`,
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                      background: `${task.subject.color}15`, color: task.subject.color, textTransform: 'uppercase', letterSpacing: 0.5
                    }}>
                      {task.subject.name}
                    </span>
                    {task.due_date && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                        Due {task.due_date}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{task.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: rate === 100 ? '#10b981' : task.subject.color }}>
                      {rate}%
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Done
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTask(task.task_id); }}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                      fontSize: 18, padding: 4, borderRadius: 6, transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#ef4444'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >
                    🗑
                  </button>
                  <span style={{
                    fontSize: 20, color: 'var(--text-muted)', transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ▼
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px 24px', background: '#fafafa' }}>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th style={{ width: 140, textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {task.students.map((s) => {
                          const st = getStatusStyle(s.status);
                          return (
                            <tr key={s.id}>
                              <td style={{ fontWeight: 600 }}>{s.name}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  onClick={() => toggleStatus(task.task_id, s.id, s.status)}
                                  className="pill"
                                  style={{
                                    padding: '6px 18px',
                                    fontSize: 12,
                                    background: st.bg,
                                    color: st.color,
                                    border: `1.5px solid ${st.border}`,
                                    width: 100,
                                    fontWeight: 700
                                  }}
                                >
                                  {st.label}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
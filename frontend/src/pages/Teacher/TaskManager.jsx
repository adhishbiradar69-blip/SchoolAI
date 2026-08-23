import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/class/1');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await api.post('/tasks/', { title: newTaskTitle, class_id: 1 });
      setNewTaskTitle('');
      fetchTasks();
    } catch (err) {
      alert('Error creating task');
    }
  };

  const toggleStatus = async (taskId, studentId, currentStatus) => {
    const next = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await api.post('/tasks/status', { task_id: taskId, student_id: studentId, status: next });
      fetchTasks();
    } catch (err) {
      alert('Error updating status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Task Manager - Class 6A</h2>
      <form onSubmit={createTask} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="New task title..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          style={{ padding: 8, width: 300 }}
        />
        <button type="submit" style={{ padding: '8px 16px', marginLeft: 10, cursor: 'pointer' }}>Add Task</button>
      </form>

      {tasks.length === 0 && <p>No tasks yet.</p>}

      {tasks.map((task) => (
        <div key={task.task_id} style={{ marginBottom: 30, border: '1px solid #444', borderRadius: 8, padding: 15 }}>
          <h3>{task.title}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: 8, border: '1px solid #ccc' }}>Student</th>
                <th style={{ padding: 8, border: '1px solid #ccc' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {task.students.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: 8, border: '1px solid #ccc' }}>{s.name}</td>
                  <td style={{ padding: 8, border: '1px solid #ccc', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleStatus(task.task_id, s.id, s.status)}
                      style={{
                        padding: '6px 16px',
                        background: s.status === 'completed' ? '#4caf50' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                      }}
                    >
                      {s.status === 'completed' ? 'Done' : 'Pending'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
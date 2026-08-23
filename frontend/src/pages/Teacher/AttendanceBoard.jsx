import { useState, useEffect } from 'react';
import api from '../../api/client';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' ? '✓ ' : '✕ '}{message}
    </div>
  );
}

export default function AttendanceBoard() {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/class/1?date=${date}`);
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const cycle = { 'P': 'A', 'A': 'L', 'L': 'P', 'Not Marked': 'P' };
        return { ...s, status: cycle[s.status] || 'P' };
      }
      return s;
    }));
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'P': return 'pill-present';
      case 'A': return 'pill-absent';
      case 'L': return 'pill-late';
      default: return 'pill-unmarked';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      case 'L': return 'Late';
      default: return 'Mark';
    }
  };

  const stats = {
    present: students.filter(s => s.status === 'P').length,
    absent: students.filter(s => s.status === 'A').length,
    late: students.filter(s => s.status === 'L').length,
    unmarked: students.filter(s => s.status === 'Not Marked').length,
  };

  const saveAttendance = async () => {
    setSaving(true);
    const marks = students.map(s => ({
      student_id: s.id,
      status: s.status === 'Not Marked' ? 'P' : s.status
    }));
    try {
      await api.post('/attendance/mark', { class_id: 1, date, marks });
      showToast('Attendance saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save attendance', 'error');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid #e2e8f0',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h2>Attendance</h2>
        <p>Mark daily attendance for Class 6A</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Present', value: stats.present, color: '#10b981', bg: '#d1fae5', icon: '✓' },
          { label: 'Absent', value: stats.absent, color: '#ef4444', bg: '#fee2e2', icon: '✕' },
          { label: 'Late', value: stats.late, color: '#f59e0b', bg: '#fef3c7', icon: '⏱' },
          { label: 'Unmarked', value: stats.unmarked, color: '#94a3b8', bg: '#f1f5f9', icon: '○' },
        ].map((stat, i) => (
          <div key={stat.label} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="glass" style={{ padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            style={{ width: 'auto', minWidth: 150 }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => markAll('P')} className="btn btn-secondary" style={{ fontSize: 13 }}>
            Mark All Present
          </button>
          <button onClick={() => markAll('A')} className="btn btn-secondary" style={{ fontSize: 13 }}>
            Mark All Absent
          </button>
          <button onClick={saveAttendance} disabled={saving} className="btn btn-primary" style={{ fontSize: 13 }}>
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap animate-slide-up">
        <table>
          <thead>
            <tr>
              <th style={{ width: 60, textAlign: 'center' }}>#</th>
              <th>Student Name</th>
              <th style={{ width: 160, textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} style={{ animationDelay: `${i * 0.02}s` }} className="animate-fade">
                <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>
                  {i + 1}
                </td>
                <td style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => toggleStatus(s.id)}
                    className={`pill ${getStatusClass(s.status)}`}
                  >
                    {getStatusLabel(s.status)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
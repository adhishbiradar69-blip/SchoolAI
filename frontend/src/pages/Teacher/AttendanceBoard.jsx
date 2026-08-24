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

export default function AttendanceBoard() {
  const { user } = useAuth();
  const classId = user?.assigned_class_id;

  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (classId) fetchAttendance();
  }, [date, classId]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2600);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/class/${classId}?date=${date}`);
      setStudents(res.data.students.map(s => ({
        ...s,
        status: s.status === 'Not Marked' ? 'P' : s.status
      })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleStatus = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const cycle = { 'P': 'A', 'A': 'L', 'L': 'P' };
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
      default: return 'pill-present';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      case 'L': return 'Late';
      default: return 'Present';
    }
  };

  const presentStudents = students.filter(s => s.status === 'P');
  const absentStudents = students.filter(s => s.status === 'A');
  const lateStudents = students.filter(s => s.status === 'L');

  const saveAttendance = async () => {
    setSaving(true);
    const marks = students.map(s => ({
      student_id: s.id,
      status: s.status
    }));
    try {
      await api.post('/attendance/mark', { class_id: classId, date, marks });
      showToast('Attendance saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save attendance', 'error');
    }
    setSaving(false);
  };

  if (!classId) {
    return (
      <div className="animate-fade" style={{ padding: 40 }}>
        <div className="glass" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Class Assigned</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please contact the administrator to assign you a class.</p>
        </div>
      </div>
    );
  }

  if (loading && students.length === 0) {
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
        <p>Mark daily attendance</p>
      </div>

      {/* Stats - clean numbers only */}
      <div className="stat-grid">
        <div className="stat-card animate-slide-up">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', fontSize: 22 }}>🏫</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px' }}>{students.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Total Students
          </div>
        </div>

        <div className="stat-card animate-slide-up">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', fontSize: 22 }}>✓</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#059669', letterSpacing: '-1px' }}>{presentStudents.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Present Today
          </div>
        </div>

        <div className="stat-card animate-slide-up">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', fontSize: 22 }}>✕</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#dc2626', letterSpacing: '-1px' }}>{absentStudents.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Absent Today
          </div>
        </div>

        <div className="stat-card animate-slide-up">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', fontSize: 22 }}>⏱</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#d97706', letterSpacing: '-1px' }}>{lateStudents.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Late Today
          </div>
        </div>
      </div>

      {/* Summary chips - only show if there are absent/late students */}
      {(absentStudents.length > 0 || lateStudents.length > 0) && (
        <div className="glass animate-slide-up" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {absentStudents.length > 0 && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#dc2626', marginBottom: 10 }}>
                  Absent ({absentStudents.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {absentStudents.map(s => (
                    <span key={s.id} style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                      color: '#991b1b',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {lateStudents.length > 0 && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#d97706', marginBottom: 10 }}>
                  Late ({lateStudents.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {lateStudents.map(s => (
                    <span key={s.id} style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      color: '#92400e',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="glass" style={{ padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onKeyDown={(e) => e.preventDefault()}
            className="input"
            style={{ width: 'auto', minWidth: 150 }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => markAll('P')} className="btn btn-secondary" style={{ fontSize: 13 }}>
            All Present
          </button>
          <button onClick={() => markAll('A')} className="btn btn-secondary" style={{ fontSize: 13 }}>
            All Absent
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap animate-slide-up">
        <table>
          <thead>
            <tr>
              <th style={{ width: 50, textAlign: 'center' }}>#</th>
              <th>Student Name</th>
              <th style={{ width: 140, textAlign: 'center' }}>Status</th>
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

      {/* Save button */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-start' }}>
        <button onClick={saveAttendance} disabled={saving} className="btn btn-primary" style={{ padding: '12px 36px', fontSize: 15 }}>
          {saving ? 'Saving...' : '💾 Save Attendance'}
        </button>
      </div>
    </div>
  );
}
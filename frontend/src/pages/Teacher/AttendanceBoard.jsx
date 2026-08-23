import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function AttendanceBoard() {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [date]);

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
        const next = s.status === 'P' ? 'A' : s.status === 'A' ? 'L' : 'P';
        return { ...s, status: next };
      }
      return s;
    }));
  };

  const saveAttendance = async () => {
    const marks = students.map(s => ({
      student_id: s.id,
      status: s.status === 'Not Marked' ? 'P' : s.status
    }));
    try {
      await api.post('/attendance/mark', { class_id: 1, date: date, marks });
      alert('Attendance saved!');
    } catch (err) {
      alert('Error saving attendance');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Attendance Board - Class 6A</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: 10, border: '1px solid #ccc' }}>#</th>
            <th style={{ padding: 10, border: '1px solid #ccc' }}>Name</th>
            <th style={{ padding: 10, border: '1px solid #ccc' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={s.id}>
              <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center' }}>{i + 1}</td>
              <td style={{ padding: 10, border: '1px solid #ccc' }}>{s.name}</td>
              <td style={{ padding: 10, border: '1px solid #ccc', textAlign: 'center' }}>
                <button onClick={() => toggleStatus(s.id)} style={{
                  padding: '8px 20px',
                  background: s.status === 'P' ? '#4caf50' : s.status === 'A' ? '#f44336' : s.status === 'L' ? '#ff9800' : '#9e9e9e',
                  color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'
                }}>
                  {s.status === 'Not Marked' ? 'P' : s.status}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveAttendance} style={{ marginTop: 20, padding: '12px 30px', fontSize: 16, cursor: 'pointer' }}>
        Save All
      </button>
    </div>
  );
}
    import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/academics/class/1/report');
      setStudents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const addStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', { name, roll_no: rollNo, class_id: 1 });
      setName(''); setRollNo('');
      fetchStudents();
    } catch (err) { alert('Error adding student'); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Students</h2>
        <p>Manage students in Class 6A</p>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>Add Student</h3>
        <form onSubmit={addStudent} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="input" style={{ flex: 1, minWidth: 200 }} required />
          <input type="text" placeholder="Roll No" value={rollNo} onChange={e => setRollNo(e.target.value)} className="input" style={{ width: 120 }} />
          <button type="submit" className="btn btn-primary">Add</button>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th style={{ textAlign: 'center' }}>Avg Score</th></tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.student_id}>
                <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: s.average_score >= 60 ? '#10b981' : '#ef4444' }}>
                  {s.average_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
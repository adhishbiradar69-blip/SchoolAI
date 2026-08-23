import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function ClassReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/academics/class/1/report');
      setReport(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading report...</div>;

  const avg = report.length ? (report.reduce((a, b) => a + b.average_score, 0) / report.length).toFixed(1) : 0;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Class Report</h2>
        <p>Academic overview for Class 6A</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>👨‍🎓</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{report.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Total Students
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>📊</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{avg}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Class Average
          </div>
        </div>
      </div>

      <div className="table-wrap animate-slide-up">
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th>Student</th>
              <th style={{ textAlign: 'center' }}>Exams</th>
              <th style={{ textAlign: 'center' }}>Average</th>
              <th style={{ textAlign: 'center' }}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {report.map((s, i) => {
              const grade = s.average_score >= 90 ? 'A+' : s.average_score >= 80 ? 'A' : s.average_score >= 70 ? 'B' : s.average_score >= 60 ? 'C' : 'D';
              const color = s.average_score >= 80 ? '#10b981' : s.average_score >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <tr key={s.student_id}>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{s.exams}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color }}>{s.average_score}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="pill" style={{ background: `${color}20`, color, minWidth: 50 }}>
                      {grade}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
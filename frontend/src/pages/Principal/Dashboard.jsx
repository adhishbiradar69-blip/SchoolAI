import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function PrincipalDashboard() {
  const [report, setReport] = useState([]);

  useEffect(() => {
    api.get('/academics/class/1/report').then(r => setReport(r.data)).catch(console.error);
  }, []);

  const topStudents = [...report].sort((a, b) => b.average_score - a.average_score).slice(0, 5);
  const avg = report.length ? (report.reduce((a, b) => a + b.average_score, 0) / report.length).toFixed(1) : 0;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Principal Dashboard</h2>
        <p>School-wide performance analytics</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>👨‍🎓</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{report.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Total Students
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>📈</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{avg}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            School Average
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>🏆</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{topStudents[0]?.name || '-'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Top Performer
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: 28, marginTop: 24 }}>
        <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>Top 5 Students</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Rank</th><th>Student</th><th style={{ textAlign: 'center' }}>Average</th></tr>
            </thead>
            <tbody>
              {topStudents.map((s, i) => (
                <tr key={s.student_id}>
                  <td style={{ fontWeight: 800, color: i === 0 ? '#f59e0b' : 'var(--text-muted)' }}>#{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#10b981' }}>{s.average_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function ChildView() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/academics/student/1');
      setMarks(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;

  const avg = marks.length ? (marks.reduce((a, b) => a + b.score, 0) / marks.length).toFixed(1) : 0;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>My Child</h2>
        <p>Performance overview for Rahul Sharma</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>📚</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{marks.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Exams Taken
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>📊</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{avg}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>
            Average Score
          </div>
        </div>
      </div>

      <div className="table-wrap animate-slide-up" style={{ marginTop: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th style={{ textAlign: 'center' }}>Score</th>
              <th style={{ textAlign: 'center' }}>Max</th>
              <th style={{ textAlign: 'center' }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m, i) => {
              const pct = ((m.score / m.max) * 100).toFixed(1);
              const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
              return (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{m.exam}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{m.score}</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{m.max}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="pill" style={{ background: `${color}20`, color }}>
                      {pct}%
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
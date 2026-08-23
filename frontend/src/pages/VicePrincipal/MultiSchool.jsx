export default function VPDashboard() {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Vice Principal</h2>
        <p>Multi-school comparison dashboard</p>
      </div>
      <div className="glass" style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🏫</p>
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Multi-School View</h3>
        <p style={{ color: 'var(--text-secondary)' }}>This feature will compare performance across multiple schools with AI-powered insights.</p>
      </div>
    </div>
  );
}
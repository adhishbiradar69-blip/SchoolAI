import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const allNavGroups = [
  {
    label: 'Teacher',
    roles: ['teacher', 'admin'],
    items: [
      { path: '/teacher/attendance', label: 'Attendance', icon: '📋' },
      { path: '/teacher/tasks', label: 'Tasks', icon: '✅' },
    ]
  },
  {
    label: 'Class Teacher',
    roles: ['teacher', 'admin'],
    items: [
      { path: '/class-teacher/report', label: 'Class Report', icon: '📊' },
    ]
  },
  {
    label: 'Administration',
    roles: ['admin'],
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '🏫' },
      { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
      { path: '/admin/classes', label: 'Classes', icon: '📚' },
    ]
  },
  {
    label: 'Management',
    roles: ['principal', 'admin'],
    items: [
      { path: '/principal/dashboard', label: 'Principal', icon: '👔' },
      { path: '/principal/ai', label: 'AI Assistant', icon: '🤖' },
    ]
  },
  {
    label: 'Vice Principal',
    roles: ['vp', 'admin'],
    items: [
      { path: '/vp/dashboard', label: 'Vice Principal', icon: '🎯' },
    ]
  },
  {
    label: 'Parents',
    roles: ['parent', 'admin'],
    items: [
      { path: '/parent/view', label: 'My Child', icon: '👨‍👩‍👧' },
    ]
  },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role || 'teacher';
  
  const visibleGroups = allNavGroups.filter(g => 
    g.roles.includes(userRole) || userRole === 'admin'
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>SchoolAI</h1>
          <p>Intelligent Management</p>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {visibleGroups.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Signed in as</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.email || 'User'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
              {userRole}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', fontSize: 13 }}>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <div key={location.pathname} className="animate-fade">
          {children}
        </div>
      </main>
    </div>
  );
}
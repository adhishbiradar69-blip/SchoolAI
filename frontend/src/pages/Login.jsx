import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!agreed) {
      setError('You must agree to the Terms and Conditions to continue.');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/teacher/attendance');
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 40%, #f3e8ff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        top: '-200px',
        right: '-150px',
      }} />
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-100px',
        left: '-100px',
      }} />

      <div className="animate-scale" style={{
        width: '100%',
        maxWidth: 440,
        padding: '0 20px',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="glass" style={{ padding: '44px 36px', textAlign: 'center' }}>
          {/* Logo mark */}
          <div style={{
            width: 56,
            height: 56,
            background: 'var(--accent-gradient)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: '0 8px 28px rgba(99,102,241,0.25)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
            </svg>
          </div>
          
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            SchoolAI Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: 14, fontWeight: 500 }}>
            Authorized personnel only
          </p>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.18)',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: 'var(--radius-xs)',
              marginBottom: 20,
              fontSize: 13,
              fontWeight: 600,
              animation: 'fadeIn 0.3s ease'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Terms checkbox */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              marginBottom: 24,
              textAlign: 'left'
            }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  marginTop: 2,
                  accentColor: 'var(--accent)',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
                I agree to the <a href="#" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>. I understand this system contains confidential student data.
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: 14, fontSize: 15 }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
        
        <p style={{
          textAlign: 'center',
          marginTop: 28,
          color: 'var(--text-muted)',
          fontSize: 12,
          fontWeight: 500
        }}>
          SchoolAI Data Intelligence Platform &middot; v1.0
        </p>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/builder');
    } catch (err: any) {
      setError('Failed to log in: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/builder');
    } catch (err: any) {
      setError('Failed to log in with Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <Card style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-8)' }}>
        <h2 className="text-display" style={{ marginBottom: 'var(--space-2)' }}>Welcome back</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Log in to access your QR codes.</p>
        
        {error && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: '#ffe3e3', borderRadius: 'var(--radius-md)' }}>{error}</div>}
        
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={{ width: '100%', marginBottom: 'var(--space-4)' }}
          leftIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.71 17.6V20.35H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.35L15.71 17.6C14.73 18.26 13.47 18.65 12 18.65C9.16 18.65 6.75 16.73 5.88 14.17H2.21V17.02C4.01 20.59 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.88 14.17C5.66 13.51 5.53 12.78 5.53 12C5.53 11.22 5.66 10.49 5.88 9.83V6.98H2.21C1.47 8.46 1.04 10.17 1.04 12C1.04 13.83 1.47 15.54 2.21 17.02L5.88 14.17Z" fill="#FBBC05"/>
              <path d="M12 5.38C13.61 5.38 15.06 5.94 16.2 7.02L19.35 3.87C17.45 2.11 14.97 1 12 1C7.7 1 4.01 3.41 2.21 6.98L5.88 9.83C6.75 7.27 9.16 5.38 12 5.38Z" fill="#EA4335"/>
            </svg>
          }
        >
          Continue with Google
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-4)' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>or email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
              placeholder="you@example.com"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" style={{ marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-btn-bg)', fontWeight: 600 }}>Sign up</Link>
        </div>
      </Card>
    </div>
  );
};

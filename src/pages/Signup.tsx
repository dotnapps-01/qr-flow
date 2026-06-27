import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/builder');
    } catch (err: any) {
      setError('Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <Card style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-8)' }}>
        <h2 className="text-display" style={{ marginBottom: 'var(--space-2)' }}>Create account</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Sign up to save and track your QR codes.</p>
        
        {error && <div style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: '#ffe3e3', borderRadius: 'var(--radius-md)' }}>{error}</div>}
        
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Confirm Password</label>
            <input 
              type="password" 
              required 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" style={{ marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
        
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-btn-bg)', fontWeight: 600 }}>Log in</Link>
        </div>
      </Card>
    </div>
  );
};

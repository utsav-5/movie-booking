import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#1a1a2e' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', padding: '30px', borderRadius: '10px', border: '1px solid rgba(128,0,128,0.3)' }}>
        <h2 style={{ color: 'white', fontSize: '28px', textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ color: '#ddd', display: 'block', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid rgba(128,0,128,0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label style={{ color: '#ddd', display: 'block', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid rgba(128,0,128,0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#9333ea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ color: '#ddd', textAlign: 'center', marginTop: '15px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#a855f7' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

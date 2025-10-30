import { useState } from 'react';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    const payload = mode === 'register' ? { email, password, name, mobile } : { email, password };
    const res = await fetch(`${API}/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.success) { setError(data.message || 'Auth failed'); return; }
    if (mode === 'register') {
      setInfo('Account created. Please login.');
      setMode('login');
      setPassword('');
      return;
    }
    localStorage.setItem('token', data.token);
    onAuth && onAuth({ token: data.token, user: data.user });
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-center font-bold">{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <input type="text" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} className="w-full" />
            <input type="tel" placeholder="Mobile number" value={mobile} onChange={e=>setMobile(e.target.value)} className="w-full" />
          </>
        )}
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full" />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full" />
        <button type="submit" className="px-4 py-2">{mode === 'login' ? 'Login' : 'Create account'}</button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {info && <div className="text-sm" style={{color:'#065f46'}}>{info}</div>}
      </form>
      <div className="text-sm" style={{marginTop:'.75rem'}}>
        {mode === 'login' ? (
          <span>Need an account? <a href="#" onClick={(e)=>{e.preventDefault();setMode('register')}}>Register</a></span>
        ) : (
          <span>Have an account? <a href="#" onClick={(e)=>{e.preventDefault();setMode('login')}}>Login</a></span>
        )}
      </div>
    </div>
  );
}

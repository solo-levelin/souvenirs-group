import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  const handleAuth = async (e) => {
    e.preventDefault()
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) window.location.reload()
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Account created! Please login.')
        setIsLogin(true)
      }
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '10vh auto', padding: '40px' }} className="glass-panel animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', color: 'var(--accent-hover)', margin: '0 0 8px 0' }}>📸 Souvenirs</h2>
        <p style={{ margin: 0 }}>{isLogin ? 'Welcome back!' : 'Create your account'}</p>
      </div>
      <form onSubmit={handleAuth}>
        <input
          className="modern-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '16px' }}
        />
        <input
          className="modern-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '24px' }}
        />
        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', textAlign: 'center', marginTop: '24px', transition: 'color 0.2s', fontSize: '14px' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span style={{ color: 'var(--accent-hover)', fontWeight: '600' }}>
          {isLogin ? 'Sign Up' : 'Login'}
        </span>
      </p>
    </div>
  )
}
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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: 'blue' }}>
        {isLogin ? 'Need account? Sign Up' : 'Have account? Login'}
      </p>
    </div>
  )
}
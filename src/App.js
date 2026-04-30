import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import CreateGroup from './components/CreateGroup'
import JoinGroup from './components/JoinGroup'
import Gallery from './components/Gallery'

export default function App() {
  const [user, setUser] = useState(null)
  const [myGroups, setMyGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)

  const [editingCode, setEditingCode] = useState(false)
  const [newGroupCode, setNewGroupCode] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const fetchMyGroups = async () => {
      const { data } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('user_id', user.id)

      setMyGroups(data?.map(d => d.groups) || [])
    }

    if (user) fetchMyGroups()
  }, [user])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleUpdateCode = async () => {
    if (!newGroupCode || newGroupCode === selectedGroup.code) {
      setEditingCode(false)
      return
    }
    const { error } = await supabase
      .from('groups')
      .update({ code: newGroupCode })
      .eq('id', selectedGroup.id)
      
    if (error) {
      alert('Error updating code: ' + error.message)
    } else {
      setSelectedGroup({ ...selectedGroup, code: newGroupCode })
      setMyGroups(myGroups.map(g => g.id === selectedGroup.id ? { ...g, code: newGroupCode } : g))
      setEditingCode(false)
    }
  }

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  if (!user) return <Auth />

  return (
    <div>
      <header style={{ 
        padding: '20px 40px', 
        background: 'var(--glass-bg)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--surface-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', background: 'linear-gradient(to right, var(--text-primary), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📸 Souvenirs
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-secondary" 
            onClick={toggleTheme} 
            style={{ padding: '8px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn-secondary" onClick={logout} style={{ padding: '8px 16px', fontSize: '14px' }}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }} className="animate-fade-in">
        {!selectedGroup ? (
          <div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <CreateGroup />
              <JoinGroup />
            </div>
            
            <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>My Groups</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '24px' 
            }}>
              {myGroups.map(group => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = 'var(--accent-hover)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                  }}
                >
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{group.name}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--accent-hover)' }}>Code: {group.code}</p>
                </div>
              ))}
              {myGroups.length === 0 && (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                  You haven't joined any groups yet. Create or join one above!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <button
              className="btn-secondary"
              onClick={() => setSelectedGroup(null)}
              style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>←</span> Back to Groups
            </button>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '28px' }}>{selectedGroup.name}</h2>
              {selectedGroup.created_by === user.id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px' }}>
                  {!editingCode ? (
                    <>
                      <span style={{ color: 'var(--text-secondary)' }}>Code: <strong style={{ color: 'var(--accent-hover)' }}>{selectedGroup.code}</strong></span>
                      <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => { setEditingCode(true); setNewGroupCode(selectedGroup.code); }}>Edit</button>
                    </>
                  ) : (
                    <>
                      <input 
                        className="modern-input" 
                        value={newGroupCode} 
                        onChange={(e) => setNewGroupCode(e.target.value)}
                        style={{ padding: '6px 12px', minWidth: '100px' }}
                      />
                      <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleUpdateCode}>Save</button>
                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setEditingCode(false)}>Cancel</button>
                    </>
                  )}
                </div>
              )}
            </div>
            <Gallery groupId={selectedGroup.id} />
          </div>
        )}
      </main>
    </div>
  )
}
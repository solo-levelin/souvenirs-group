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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

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

  if (!user) return <Auth />

  return (
    <div>
      <header style={{ 
        padding: '20px 40px', 
        background: 'rgba(0,0,0,0.5)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--surface-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', background: 'linear-gradient(to right, #fff, #9ba1a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📸 Souvenirs
        </h1>
        <button className="btn-secondary" onClick={logout} style={{ padding: '8px 16px', fontSize: '14px' }}>Logout</button>
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
            <h2 style={{ marginBottom: '24px', fontSize: '28px' }}>{selectedGroup.name}</h2>
            <Gallery groupId={selectedGroup.id} />
          </div>
        )}
      </main>
    </div>
  )
}
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
    <div style={{ fontFamily: 'Arial' }}>
      <header style={{ padding: '20px', background: '#333', color: 'white' }}>
        <h1>📸 Souvenirs</h1>
        <button onClick={logout} style={{ float: 'right' }}>Logout</button>
      </header>

      {!selectedGroup ? (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <CreateGroup />
            <JoinGroup />
          </div>
          
          <h2>My Groups</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {myGroups.map(group => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                style={{
                  padding: '20px',
                  border: '2px solid #333',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <h3>{group.name}</h3>
                <p style={{ fontSize: '12px', color: '#666' }}>Code: {group.code}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedGroup(null)}
            style={{ margin: '20px', padding: '10px' }}
          >
            ← Back
          </button>
          <h2 style={{ padding: '0 20px' }}>{selectedGroup.name}</h2>
          <Gallery groupId={selectedGroup.id} />
        </div>
      )}
    </div>
  )
}
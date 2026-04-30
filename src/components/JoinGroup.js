import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function JoinGroup() {
  const [code, setCode] = useState('')

  const joinGroup = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('code', code)
      .single()

    if (group) {
      const { error } = await supabase
        .from('group_members')
        .insert([{ group_id: group.id, user_id: user.id }])

      if (!error) {
        alert('Joined group!')
        window.location.reload()
      } else {
        alert('Already member or error')
      }
    } else {
      alert('Group not found')
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '280px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Join Group</h3>
      <form onSubmit={joinGroup}>
        <input
          className="modern-input"
          placeholder="Enter Group Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <button type="submit" className="btn-secondary" style={{ width: '100%', padding: '12px' }}>Join Group</button>
      </form>
    </div>
  )
}
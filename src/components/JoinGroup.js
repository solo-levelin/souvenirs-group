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

      if (!error) alert('Joined group!')
      else alert('Already member or error')
    } else {
      alert('Group not found')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Join Group</h2>
      <form onSubmit={joinGroup}>
        <input
          placeholder="Enter Group Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ padding: '10px', margin: '10px', width: '200px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Join</button>
      </form>
    </div>
  )
}
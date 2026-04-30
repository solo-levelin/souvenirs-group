import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CreateGroup() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const createGroup = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{ name, code, created_by: user.id }])
        .select()

      if (groupError) throw groupError

      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: groupData[0].id, user_id: user.id }])

      if (memberError && !memberError.message.includes('duplicate')) {
        throw memberError
      }

      alert('Group created! Code: ' + code)
      setName('')
      setCode('')
      window.location.reload()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', flex: 1, minWidth: '280px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Create New Group</h3>
      <form onSubmit={createGroup}>
        <input
          className="modern-input"
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: '12px' }}
        />
        <input
          className="modern-input"
          placeholder="Unique Code (e.g., TRIP2024)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Create Group</button>
      </form>
    </div>
  )
}
import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CreateGroup() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const createGroup = async (e) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('User:', user.id)
      
      // 1. Create group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{ name, code, created_by: user.id }])
        .select()

      if (groupError) {
        console.log('Group error:', groupError)
        throw groupError
      }

      console.log('Group created:', groupData)

      // 2. Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([{ group_id: groupData[0].id, user_id: user.id }])

      if (memberError) {
        console.log('Member error:', memberError)
        // Ignore "already member" error
        if (!memberError.message.includes('duplicate')) {
          throw memberError
        }
      }

      alert('Group created! Code: ' + code)
      setName('')
      setCode('')
      window.location.reload()
    } catch (error) {
      console.log('Final error:', error)
      alert('Error: ' + error.message)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create Group</h2>
      <form onSubmit={createGroup}>
        <input
          placeholder="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '10px', margin: '10px', width: '200px' }}
        />
        <input
          placeholder="Unique Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ padding: '10px', margin: '10px', width: '200px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>Create</button>
      </form>
    </div>
  )
}
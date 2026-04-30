import { useState } from 'react'
import { supabase } from '../supabaseClient'

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET

export default function Upload({ groupId }) {
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('media').insert([{
      group_id: groupId,
      url: data.secure_url,
      type: file.type.startsWith('video') ? 'video' : 'photo',
      uploaded_by: user.id
    }])

    setUploading(false)
    alert('Uploaded!')
    window.location.reload()
  }

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={uploadFile}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  )
}
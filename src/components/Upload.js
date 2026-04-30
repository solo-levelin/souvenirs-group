import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET

export default function Upload({ groupId }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)

  const uploadFiles = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)
    
    const { data: { user } } = await supabase.auth.getUser()
    let completed = 0;
    
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          { method: 'POST', body: formData }
        )
        const data = await res.json()

        if (data.error) {
          throw new Error(data.error.message)
        }
        
        const { error: dbError } = await supabase.from('media').insert([{
          group_id: groupId,
          url: data.secure_url,
          type: (file.type && file.type.startsWith('video')) ? 'video' : 'photo',
          uploaded_by: user.id
        }])

        if (dbError) {
          throw new Error(dbError.message)
        }
        
        completed++;
        setProgress(Math.round((completed / files.length) * 100))
      } catch (err) {
        console.error("Upload failed for file:", file?.name, err)
        alert(`Error uploading ${file?.name || 'file'}: ${err.message}`)
      }
    })

    await Promise.all(uploadPromises)

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    window.location.reload()
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Add Memories</h3>
      
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={uploadFiles}
        disabled={uploading}
        style={{ display: 'none' }}
        id="file-upload"
        ref={fileInputRef}
      />
      <label 
        htmlFor="file-upload" 
        className="btn-primary"
        style={{ display: 'inline-block', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
      >
        {uploading ? `Uploading... ${progress}%` : 'Select Photos & Videos'}
      </label>
      <p style={{ fontSize: '12px', marginTop: '12px', color: 'var(--text-secondary)' }}>
        You can select multiple files at once
      </p>
    </div>
  )
}
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Upload from './Upload'

export default function Gallery({ groupId }) {
  const [media, setMedia] = useState([])
  const [selectedMedia, setSelectedMedia] = useState([])
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchMedia = async () => {
      const { data } = await supabase
        .from('media')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })

      setMedia(data || [])
    }

    fetchMedia()
  }, [groupId])

  const toggleSelect = (id) => {
    setSelectedMedia(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const handleMediaError = async (id) => {
    setMedia(prev => prev.filter(m => m.id !== id))
    try {
      await supabase.from('media').delete().eq('id', id)
    } catch (e) {
      console.error('Failed to delete broken media from DB', e)
    }
  }

  const downloadSelected = async () => {
    setDownloading(true)
    for (const id of selectedMedia) {
      const item = media.find(m => m.id === id)
      if (item) {
        try {
          const response = await fetch(item.url)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = url
          const extension = item.type === 'video' ? 'mp4' : 'jpg'
          a.download = `souvenir_${item.id}.${extension}`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } catch (error) {
          console.error("Failed to download", error)
        }
      }
    }
    setSelectedMedia([])
    setDownloading(false)
  }

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <Upload groupId={groupId} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Gallery</h3>
        {selectedMedia.length > 0 && (
          <button 
            className="btn-primary" 
            onClick={downloadSelected}
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : `Download Selected (${selectedMedia.length})`}
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
        gap: '20px'
      }}>
        {media.map((item) => {
          const isSelected = selectedMedia.includes(item.id)
          return (
            <div 
              key={item.id} 
              className="glass-panel"
              onClick={() => toggleSelect(item.id)}
              style={{ 
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                border: isSelected ? '2px solid var(--accent-hover)' : '1px solid transparent',
                transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'var(--accent-hover)',
                  color: 'white',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  ✓
                </div>
              )}
              {item.type === 'photo' ? (
                <img 
                  src={item.url} 
                  alt="" 
                  style={{ 
                    width: '100%', 
                    height: '220px', 
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                  onError={() => handleMediaError(item.id)}
                />
              ) : (
                <video 
                  src={item.url} 
                  controls={!isSelected} 
                  style={{ 
                    width: '100%', 
                    height: '220px',
                    objectFit: 'cover',
                    display: 'block'
                  }} 
                  onError={() => handleMediaError(item.id)}
                />
              )}
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.4)' }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      
      {media.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No memories yet. Be the first to upload!
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Upload from './Upload'

export default function Gallery({ groupId }) {
  const [media, setMedia] = useState([])
  const [selectedMedia, setSelectedMedia] = useState([])
  const [downloading, setDownloading] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

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

  const getOptimizedUrl = (url) => {
    if (!url) return '';
    // If it's a cloudinary URL, inject f_auto,q_auto for better browser support (fixes HEIC etc)
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    return url;
  }

  const isVideo = (item) => {
    if (item.type === 'video') return true;
    if (item.url && item.url.toLowerCase().match(/\.(mp4|mov|webm|ogg)$/i)) return true;
    return false;
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
          const extension = isVideo(item) ? 'mp4' : 'jpg'
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ margin: 0 }}>Gallery</h3>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {media.length > 0 && (
            <div style={{ display: 'flex', background: 'var(--surface-color)', borderRadius: '8px', padding: '4px' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ 
                  background: viewMode === 'grid' ? 'var(--accent-hover)' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)',
                  border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                ▦ Grid
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ 
                  background: viewMode === 'list' ? 'var(--accent-hover)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--text-secondary)',
                  border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                ▬ List
              </button>
            </div>
          )}

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
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr', 
        gap: '20px',
        maxWidth: viewMode === 'list' ? '800px' : '100%',
        margin: viewMode === 'list' ? '0 auto' : '0'
      }}>
        {media.map((item) => {
          const isItemSelected = selectedMedia.includes(item.id)
          const optimizedUrl = getOptimizedUrl(item.url)
          const mediaIsVideo = isVideo(item)

          return (
            <div 
              key={item.id} 
              className="glass-panel"
              onClick={() => toggleSelect(item.id)}
              style={{ 
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                border: isItemSelected ? '2px solid var(--accent-hover)' : '1px solid transparent',
                transform: isItemSelected ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              {isItemSelected && (
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
              {!mediaIsVideo ? (
                <img 
                  src={optimizedUrl} 
                  alt="" 
                  style={{ 
                    width: '100%', 
                    height: viewMode === 'grid' ? '220px' : 'auto', 
                    maxHeight: viewMode === 'list' ? '800px' : 'none',
                    objectFit: viewMode === 'grid' ? 'cover' : 'contain',
                    display: 'block',
                    background: 'rgba(0,0,0,0.2)'
                  }}
                  onError={(e) => {
                    // Fallback to original url if optimized fails
                    if (e.target.src !== item.url) {
                      e.target.src = item.url;
                    }
                  }}
                />
              ) : (
                <video 
                  src={optimizedUrl} 
                  controls={viewMode === 'list' || !isItemSelected} 
                  style={{ 
                    width: '100%', 
                    height: viewMode === 'grid' ? '220px' : 'auto',
                    maxHeight: viewMode === 'list' ? '800px' : 'none',
                    objectFit: viewMode === 'grid' ? 'cover' : 'contain',
                    display: 'block',
                    background: 'rgba(0,0,0,0.2)'
                  }}
                  onError={(e) => {
                    // Fallback to original url if optimized fails
                    if (e.target.src !== item.url) {
                      e.target.src = item.url;
                    }
                  }}
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

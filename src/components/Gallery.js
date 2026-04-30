import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import Upload from './Upload'

export default function Gallery({ groupId }) {
  const [media, setMedia] = useState([])

  useEffect(() => {
    fetchMedia()
  }, [groupId])

  const fetchMedia = async () => {
    const { data } = await supabase
      .from('media')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    setMedia(data || [])
  }

  return (
    <div>
      <Upload groupId={groupId} />
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '10px', 
        padding: '20px' 
      }}>
        {media.map((item) => (
          <div key={item.id} style={{ 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            overflow: 'hidden' 
          }}>
            {item.type === 'photo' ? (
              <img src={item.url} alt="" style={{ 
                width: '100%', 
                height: '200px', 
                objectFit: 'cover' 
              }} />
            ) : (
              <video src={item.url} controls style={{ 
                width: '100%', 
                height: '200px' 
              }} />
            )}
            <p style={{ padding: '5px', fontSize: '12px' }}>
              {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

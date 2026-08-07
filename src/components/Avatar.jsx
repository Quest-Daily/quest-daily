import { useLocalStorage } from '../hooks'

export default function Avatar({ child, size = 92, square = false }) {
  const [photo] = useLocalStorage(`photo_${child.id}`, null)
  const borderRadius = square ? Math.round(size * 0.22) : '50%'

  return (
    <div style={{
      width: size,
      height: size,
      margin: '0 auto',
      borderRadius,
      background: '#fff',
      padding: square ? 0 : 4,
      boxShadow: `0 5px 14px ${child.theme.shadow}`,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {photo ? (
        <img
          src={photo}
          alt={child.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius,
          background: child.theme.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'DM Serif Display', serif",
          fontSize: Math.round(size * 0.4),
          lineHeight: 1,
          color: child.theme.accent,
          userSelect: 'none',
          paddingTop: '0.05em',
        }}>
          {child.avatar}
        </div>
      )}
    </div>
  )
}

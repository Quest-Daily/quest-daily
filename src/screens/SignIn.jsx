import { CHILDREN, CHILD_ORDER } from '../data'
import Avatar from '../components/Avatar'

export default function SignIn({ onSelect }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fdf5f1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Hanken Grotesque', sans-serif",
      color: '#3a3340',
    }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 12,
        letterSpacing: '0.26em',
        textTransform: 'uppercase',
        color: '#a8689a',
        marginBottom: 6,
      }}>Quest Daily</div>
      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 'clamp(38px, 8vw, 54px)',
        letterSpacing: '-0.01em',
        color: '#3a3340',
        margin: '16px 0 0',
      }}>Who's here?</h1>
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 14,
        letterSpacing: '0.06em',
        color: '#9a8fa6',
        margin: '12px 0 44px',
      }}>Tap your photo to jump in</p>

      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 900,
      }}>
        {CHILD_ORDER.map(id => {
          const child = CHILDREN[id]
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className="press-btn"
              style={{
                width: 180,
                background: child.theme.bg,
                borderRadius: 26,
                padding: '28px 20px',
                boxShadow: `0 8px 22px ${child.theme.shadow}`,
                textAlign: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.04)'
                e.currentTarget.style.boxShadow = `0 12px 28px ${child.theme.shadowDeep}`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = `0 8px 22px ${child.theme.shadow}`
              }}
            >
              <Avatar child={child} size={110} />
              <div style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 27,
                lineHeight: 1.15,
                color: '#3a3340',
                marginTop: 16,
              }}>{child.name}</div>
            </button>
          )
        })}

        <button
          onClick={() => onSelect('parent')}
          className="press-btn"
          style={{
            width: 180,
            background: '#3a3340',
            borderRadius: 26,
            padding: '28px 20px',
            boxShadow: '0 8px 22px rgba(58,51,64,.22)',
            textAlign: 'center',
            border: 'none',
            cursor: 'pointer',
            color: '#fdf5f1',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: 110,
            height: 110,
            margin: '0 auto',
            borderRadius: '50%',
            background: '#4a434f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LockIcon />
          </div>
          <div style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 27,
            marginTop: 16,
          }}>Parent</div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.14em',
            color: '#b6afa3',
            marginTop: 4,
          }}>PIN REQUIRED</div>
        </button>
      </div>
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fdf5f1" strokeWidth="1.8">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

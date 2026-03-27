import { useState, useRef, useEffect, type ReactNode } from 'react';

export function Tip({ text, children }: { text: string; children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [above, setAbove] = useState(true);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && tipRef.current) {
      const rect = tipRef.current.getBoundingClientRect();
      if (rect.top < 8) setAbove(false);
      else setAbove(true);
    }
  }, [show]);

  return (
    <div
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}
      {show && (
        <div
          ref={tipRef}
          className="pointer-events-none"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(above
              ? { bottom: '100%', marginBottom: 8 }
              : { top: '100%', marginTop: 8 }),
            zIndex: 100,
            maxWidth: 240,
            width: 'max-content',
            padding: '8px 12px',
            borderRadius: 8,
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            fontSize: 12,
            lineHeight: 1.4,
            fontWeight: 500,
            letterSpacing: '0.01em',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            opacity: 1,
            animation: 'tooltipFadeIn 150ms ease-out',
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              ...(above
                ? { top: '100%', borderTop: '5px solid var(--color-text)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent' }
                : { bottom: '100%', borderBottom: '5px solid var(--color-text)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent' }),
              width: 0,
              height: 0,
            }}
          />
        </div>
      )}
    </div>
  );
}

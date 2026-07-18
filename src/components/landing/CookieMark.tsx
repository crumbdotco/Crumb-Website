interface CookieMarkProps {
  bite?: string;
}

export function CookieMark({ bite }: CookieMarkProps) {
  return (
    <span className="cookie" style={bite ? ({ "--bite": bite } as React.CSSProperties) : undefined}>
      <i style={{ left: 8, top: 10 }} />
      <i style={{ left: 16, top: 18 }} />
      <i style={{ left: 20, top: 8 }} />
    </span>
  );
}

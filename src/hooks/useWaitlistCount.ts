'use client';
import { useEffect, useState } from 'react';

// Visible count = real signups + this baseline. Avoids embarrassing "0 on the waitlist"
// while still tracking real growth (every new signup ticks the number up).
const BASELINE = 100;

export function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/waitlist/count')
      .then((r) => r.json() as Promise<{ count: number }>)
      .then((d) => setCount((d.count ?? 0) + BASELINE))
      .catch(() => setCount(BASELINE));
  }, []);
  return count;
}

'use client';
import { useEffect, useState } from 'react';

export function useWaitlistCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/waitlist/count')
      .then((r) => r.json() as Promise<{ count: number }>)
      .then((d) => setCount(d.count))
      .catch(() => setCount(900));
  }, []);
  return count;
}

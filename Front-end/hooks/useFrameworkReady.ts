import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // No-op for React Native CLI
  }, []);
}

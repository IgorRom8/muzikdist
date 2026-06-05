'use client'

import { useEffect, useState } from 'react'

/** true only after client mount — avoids SSR/client HTML mismatch */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

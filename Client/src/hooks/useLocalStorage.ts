import { useEffect, useState } from 'react'

export default function useLocalStorage(key: string, initialValue?: string | number) {
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(key)
    if (jsonValue != null) return JSON.parse(jsonValue)
    return initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value || null))
  }, [key, value])

  return [value, setValue]
}

import { useState } from 'react'
import soundFile from '../assets/sounds/notification.mp3'

export default function Common() {
  const [audioPlaying, setAudioPlaying] = useState(false)
  const playNotificationSound = () => {
    document.title = '🔴 ConnectUs - Nowa wiadomość'
    if (!audioPlaying && localStorage.getItem('muteNotifications') !== 'true') {
      const audio = new Audio(soundFile)
      audio.volume = 0.25
      audio.play()
      setAudioPlaying(true)
      setTimeout(() => {
        setAudioPlaying(false)
      }, 500)
    }
  }

  const toggleColorMode = (colorMode: string) => {
    const html = document.documentElement
    if (colorMode === 'true') {
      html.setAttribute('data-theme', 'dark')
    } else {
      html.setAttribute('data-theme', 'light')
    }
  }

  return { playNotificationSound, toggleColorMode }
}

export { Common }

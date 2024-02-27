import { useState, useRef, ChangeEvent, useEffect } from 'react'
import '../assets/audioPlayer.scss'
import playIcon from '../assets/images/play.svg'
import pauseIcon from '../assets/images/pause.svg'
import volumeUpIcon from '../assets/images/volumeup.svg'
import volumeDownIcon from '../assets/images/volumedown.svg'
import volumeIcon from '../assets/images/volume.svg'

const CustomAudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audioElement = audioRef.current
    if (audioElement) {
      audioElement.addEventListener('ended', handleSongEnd)
      return () => {
        audioElement.removeEventListener('ended', handleSongEnd)
      }
    }
  }, [])

  const handleSongEnd = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    const audioElement = audioRef.current
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause()
      } else {
        audioElement.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    const audioElement = audioRef.current
    if (audioElement) {
      setCurrentTime(audioElement.currentTime)
    }
  }

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value
    }
  }

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setCurrentTime(value)
    const audioElement = audioRef.current
    if (audioElement) {
      audioElement.currentTime = value
    }
  }

  return (
    <div className="custom-audio-player">
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate}></audio>
      <div className="controls">
        <button onClick={togglePlay}>
          {isPlaying ? <img src={pauseIcon} alt="Pauza" /> : <img src={playIcon} alt="Play" />}
        </button>
        <input
          type="range"
          value={currentTime}
          onChange={handleSeek}
          min={0}
          step={0.01}
          max={audioRef.current ? audioRef.current.duration : 0}
        />
        <div className="volume-control">
          <img src={volumeIcon} className="change-volume" alt="Zmień głośność" />
          <div className="volumeInput">
            <img src={volumeUpIcon} alt="Zwiększ głośność" />

            <input
              type="range"
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.05}
            />

            <img src={volumeDownIcon} alt="Zmniejsz głośność" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomAudioPlayer

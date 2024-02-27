import { useState } from 'react'
import '../assets/lightboxStyle.scss'
import downloadIcon from '../assets/images/download.svg'

interface LightboxProps {
  imageUrl: string
  altText: string | undefined
}

export default function Lightbox({ imageUrl, altText }: LightboxProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  const toggleLightbox = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="lightbox__container">
      <img src={imageUrl} alt={altText} onClick={toggleLightbox} className="lightbox__thumbnail" />
      {isOpen && (
        <div className="lightbox__backdrop" onClick={toggleLightbox}>
          <div className="lightbox__content">
            <img src={imageUrl} alt={altText} className="lightbox__image" />
            <a href={imageUrl} download={altText}>
              <span className="icon">
                <img src={downloadIcon} alt="Pobierz" />
              </span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

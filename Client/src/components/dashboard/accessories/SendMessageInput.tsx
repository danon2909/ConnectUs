import { ChangeEvent, FormEvent } from 'react'
import Lightbox from '../../Lightbox'
import sendIcon from '../../../assets/images/sendIcon.svg'
import attachmentIcon from '../../../assets/images/attachmentIcon.svg'
import crossIcon from '../../../assets/images/cross.svg'

interface SendMessageInputProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  handleScroll: () => void
  handleAddFile: (e: ChangeEvent<HTMLInputElement>) => Promise<void>
  text: string
  setText: (text: string) => void
  deleteFile: (index: number) => void
  files: File[]
}

export default function SendMessageInput({
  handleSubmit,
  handleScroll,
  handleAddFile,
  text,
  setText,
  deleteFile,
  files
}: SendMessageInputProps): JSX.Element {
  return (
    <form onSubmit={handleSubmit} onScroll={handleScroll} className="sendMessage__container">
      <div className="attachments">
        {files.map((file: File, i: number) => (
          <div className="attachment" key={i}>
            <div onClick={() => deleteFile(i)} className="deleteAttachment">
              <img src={crossIcon} alt="X" />
            </div>
            {file.type.startsWith('image/') ? (
              <div className="image__preview">
                <Lightbox imageUrl={URL.createObjectURL(file)} altText={file.name} />
              </div>
            ) : (
              <div>{file.name}</div>
            )}
          </div>
        ))}
      </div>
      <div className="sendMessage__input">
        <input
          value={text}
          type="text"
          placeholder="Zacznij pisać..."
          maxLength={150}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
        ></input>
        <div className="icons">
          <label htmlFor="files" className="input__icon">
            <img src={attachmentIcon} alt="Wybierz plik" />
          </label>
          <input
            type="file"
            id="files"
            style={{ display: 'none' }}
            onChange={handleAddFile}
            multiple
          />
          <button type="submit" className="input__icon">
            <img src={sendIcon} className="send" alt="Wyślij" />
          </button>
        </div>
      </div>
    </form>
  )
}

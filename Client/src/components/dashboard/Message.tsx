import { Fragment } from 'react'
import { MessagesInterface } from '../../types/common.model.ts'
import Lightbox from '../Lightbox'
import { Socket } from 'socket.io-client'
import trashIcon from '../../assets/images/trash.svg'
import AudioPlayer from '../AudioPlayer.tsx'

export default function Message(
  m: MessagesInterface,
  i: number,
  socket: Socket | undefined,
  earlier?: string
) {
  const deleteMessage = (id: number) => {
    socket?.emit('delete-message', { id: id })
  }
  if (m.sender.toString() === '0') {
    return (
      <div key={i}>
        <div style={{ color: 'gray', textAlign: 'center' }}>{m.text}</div>
      </div>
    )
  }
  return (
    <Fragment key={m.id}>
      {earlier !== m.senderName ? (
        <div className={`sender ${!m.fromMe ? 'received' : ''}`}>{m.senderName}</div>
      ) : null}

      <div className={`message ${!m.fromMe ? 'received' : ''}`}>
        {m.file ? (
          m.filePrefixData?.startsWith('data:image') ? (
            <div className="image">
              <Lightbox imageUrl={`${m.filePrefixData},${m.fileData}`} altText={m.fileName} />
            </div>
          ) : m.filePrefixData?.startsWith('data:video') ? (
            <div className="video">
              <video controls>
                <source
                  src={`${m.filePrefixData},${m.fileData}`}
                  type={`video/${m.filePrefixData.split('/')[1].split(';')[0]}`}
                ></source>
              </video>
            </div>
          ) : m.filePrefixData?.startsWith('data:audio') ? (
            <div className="audio">
              <AudioPlayer src={`${m.filePrefixData},${m.fileData}`} />
            </div>
          ) : (
            <div className="link">
              <a href={`${m.filePrefixData},${m.fileData}`} download={m.fileName}>
                {m.fileName}
              </a>
            </div>
          )
        ) : (
          <>{m.text}</>
        )}
        {m.fromMe ? (
          <div className="delete__message" onClick={() => deleteMessage(m.id)}>
            <img src={trashIcon} alt="X" />
          </div>
        ) : null}
      </div>
    </Fragment>
  )
}

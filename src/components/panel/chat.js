import '../../CSS/panel/chat.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPaperPlane, faUser } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from 'react';

library.add(faPaperPlane, faUser)

const Chat = ({ temp }) => {
    const [messages, setMessages] = useState([])
    const [messageValue, setMessageValue] = useState('')
    const [socket, setSocket] = useState(temp.socket)
    const [user, setUser] = useState(temp.user)

    const notificacion = (msg) => {
        const toast = document.getElementById('toasts')
        const notif = document.createElement('div')
        const messageDiv = document.createElement('div')
        const header = document.createElement('p')
        const b = document.createElement('b')
        const content = document.createElement('p')

        notif.classList.add('toast')
        messageDiv.classList.add('message')

        toast.appendChild(notif)
        notif.appendChild(messageDiv)
        messageDiv.appendChild(header)
        messageDiv.appendChild(content)
        header.appendChild(b)
        
        b.innerHTML = msg.emisor
        header.innerHTML += ` ${msg.time}`
        content.innerText = msg.msg

        setTimeout(() => { notif.remove() }, 5000)
    }

    const sendMessage = (e) => {
        e.preventDefault()
        const date = (new Date()).toLocaleTimeString('en-US')
        setMessages([...messages, {
            'emisor': 'Tú',
            'time': date,
            'msg': messageValue
        }])
        socket.emit('send-message', {
            'emisor': user.name,
            'time': date,
            'msg': messageValue
        })
        setMessageValue('')
    }

    useEffect(() => {
        const content = document.querySelector('#chat .contenido')
        content.scrollTop = content.scrollHeight
    }, [messages])

    useEffect(() => {
        setSocket(temp.socket)
        setUser(temp.user)
    }, [temp])

    useEffect(() => {
        if (socket == null) return

        const handler = (newMessage) => {
            const allOptions = document.querySelector('.main-screen')
            if(!allOptions.classList.contains('main-screen-collapse')) notificacion(newMessage)
            setMessages([...messages, newMessage])
        }
        socket.on('receive-message', handler)

        return () => {
            socket.off('receive-message', handler)
        }
    }, [socket, messages])

    return (
        <li id="chat">
            <section>
                <h3>Mensajes en la llamada</h3>
                <p>
                    Los mensajes solo son visibles para los participantes 
                    de la llamada y se borran cuando finaliza
                </p>
            </section>
            <hr />
            <div className='contenido'>
                {messages.map((msg, index) => {
                    return (
                        <div className='message' key={index}>
                            <p><b>{msg.emisor}</b> {msg.time}</p>
                            <p>{msg.msg}</p>
                        </div>
                    )
                })}
            </div>
            <form onSubmit={sendMessage} className='search'>
                <input value={messageValue} required onChange={e => setMessageValue(e.target.value)} type='text' placeholder='Envia un mensaje' />
                <button type='submit'><FontAwesomeIcon icon='fa-solid fa-paper-plane' /></button>
            </form>
        </li>
    )
}

export default Chat;
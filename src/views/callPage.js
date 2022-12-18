import '../CSS/views/callPage.css'
import MainScreen from '../components/mainScreen/mainScreen'
import Modal from '../components/utils/modal'
import Options from '../components/footer/options'
import Menu from '../components/footer/menu'
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

const CallPage = ({ temp, update }) => {
    const [users, setUsers] = useState(temp.users)
    const [user, setUser] = useState(temp.user)
    const [socket, setSocket] = useState(temp.socket)
    const [isAdmin, setIsAdmin] = useState(temp.isAdmin)
    const [isShareScreen, setIsShareScreen] = useState(false)
    const [optionsCall, setOptionsCall] = useState(temp.optionsCall)
    const [stream, setStream] = useState(temp.stream)
    const [btnOptions, setBtnOptions] = useState({
        microphone: ['microphone-slash', 'microphone', 'option-inactive', ''],
        video: ['video-slash', 'video', 'option-inactive', ''],
        hand: ['hand', 'hand', '', 'option-active'],
        screen: ['arrow-up-from-bracket', 'arrow-up-from-bracket', '', 'option-active'],
        phone: ['phone-flip', 'phone-flip', 'option-inactive', 'option-inactive']
    })

    const copyLink = () => {
        const aux = document.createElement("input");
        aux.setAttribute("value", document.getElementById('copylink').innerHTML);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
    }

    const sendEmail = async (e) => {
        e.preventDefault()
        const { value: email } = await Swal.fire({
            title: 'Agregar personas',
            input: 'email',
            inputPlaceholder: 'Escriba un correo',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Enviar'
        })
        if (email) {
            const aux = document.createElement("a");
            const URL = document.getElementById('copylink').innerHTML
            const subject = `En este momento: ${user.name} te acaba de invitar a una videollamada`
            const message = `Edilberto <${email}> te está invitando a unirte a una videollamada en curso.
                            \nEnlace de reunión: ${URL}`
            aux.setAttribute('href', `mailto:${email}?subject=${subject}&body=${message}`)
            document.body.appendChild(aux);
            aux.click()
            document.body.removeChild(aux);
        }
    }

    const raiseLowerHand = (itemID, opacityHand) => {
        const indice = users.findIndex(p => p.id === itemID);
        const tempUser = users[indice]
        tempUser.opacityHand = opacityHand
        update.setUser(tempUser)
        update.setUsers(users.fill(tempUser, indice, indice + 1))
    }

    const initVideo = (key) => {
        const values = {
            "AUDIO ACTIVADO": () => {
                document.querySelector(`#screen-${user.id} section svg`).style.opacity = '1'
            },
            "AUDIO DESACTIVADO": () => {
                document.querySelector(`#screen-${user.id} section svg`).style.opacity = '0'
            },
            "VIDEO ACTIVADO": () => {
                document.querySelector(`#screen-${user.id} ul .default-video`).classList.remove('video-active')
                document.querySelector(`#screen-${user.id} ul .user-video`).classList.add('video-active')
            },
            "VIDEO DESACTIVADO": () => {
                document.querySelector(`#screen-${user.id} ul .user-video`).classList.remove('video-active')
                document.querySelector(`#screen-${user.id} ul .default-video`).classList.add('video-active')
            }
        }

        values[key]()
    }

    const lanzarNotificacion = (user, message) => {
        const contenedor = document.createElement('div')
        contenedor.setAttribute('id', 'notificacion-peer')
        const span = document.createElement('span')
        span.style.backgroundColor = user.color
        span.innerHTML = user.name.charAt(0)
        const section = document.createElement('section')
        section.innerHTML = `${user.name} ${message}`
        contenedor.appendChild(span)
        contenedor.appendChild(section)
        document.body.appendChild(contenedor)

        setTimeout(() => { contenedor.remove() }, 5000)
    }

    // Actualizo el estado
    useEffect(() => {
        setSocket(temp.socket)
        setUser(temp.user)
        setUsers(temp.users)
        setOptionsCall(temp.optionsCall)
        setIsAdmin(temp.isAdmin)
        setStream(temp.stream)
    }, [temp])

    return (
        <div className="call-div">
            <MainScreen temp={{ optionsCall, users, isAdmin, 
                socket, stream, user, isShareScreen, btnOptions }} 
            update={{ initVideo, setBtnOptions, setIsShareScreen, setUsers: update.setUsers, 
                setIsAdmin: update.setIsAdmin, setUser: update.setUser, lanzarNotificacion }} />
            {isAdmin && <Modal update={{ copyLink, sendEmail }} temp={{ roomID: temp.roomID }} />}
            <footer>
                <div className='footer-section'>{temp.roomID}</div>
                <Options temp={{ users, isAdmin, user, optionsCall, 
                    socket, roomID: temp.roomID, isShareScreen, btnOptions }} 
                    update={{ initVideo, raiseLowerHand, setBtnOptions, lanzarNotificacion }} />
                <Menu update={{ copyLink, sendEmail }} 
                    temp={{ socket, user, isAdmin, users, roomID: temp.roomID }} />
            </footer>
        </div>
    )
}

export default CallPage;
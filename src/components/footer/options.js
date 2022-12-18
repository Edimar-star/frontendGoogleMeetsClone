import '../../CSS/footer/options.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { 
    faMicrophoneSlash, faMicrophone, faVideoSlash, 
    faVideo, faHand, faArrowUpFromBracket, faPhoneFlip 
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

library.add(
    faMicrophoneSlash, faMicrophone, faVideoSlash, 
    faVideo, faHand, faArrowUpFromBracket, faPhoneFlip
)

const Options = ({ temp, update }) => {
    const navigate = useNavigate()
    const [user, setUser] = useState(temp.user)
    const [socket, setSocket] = useState(temp.socket)
    const [users, setUsers] = useState(temp.users)
    const [isShareScreen, setIsShareScreen] = useState(temp.isShareScreen)
    const [optionsCall, setOptionsCall] = useState(temp.optionsCall)
    const [isAdmin, setIsAdmin] = useState(temp.isAdmin)
    const [options, setOptions] = useState(temp.btnOptions)

    const functionOptions = {
        'microphone-': () => update.initVideo("AUDIO ACTIVADO"),
        'microphone-option-inactive': () => update.initVideo("AUDIO DESACTIVADO"),
        'video-': () => update.initVideo("VIDEO ACTIVADO"),
        'video-option-inactive': () => update.initVideo("VIDEO DESACTIVADO"),
        'hand-': () => { // Bajo la mano
            const opacityHand = '0'
            update.raiseLowerHand(user.id, opacityHand)
            socket.emit('raise-lower-hand', { user, opacityHand })
        },
        'hand-option-active': () => { // Levanto la mano
            const opacityHand = '1'
            update.lanzarNotificacion(user, " (Tú) acaba de alzar la mano")
            update.raiseLowerHand(user.id, opacityHand)
            socket.emit('raise-lower-hand', { user, opacityHand })
        },
        'screen-option-active': () => { // Comparto pantalla
            document.querySelector(`.main-screen .screens`).style.opacity = '0'
            document.querySelector(`.main-screen .video-screen`).style.opacity = '1'
            if (isShareScreen) {
                const option = 'screen'
                const data = [options[option][0], options[option][1], options[option][2], options[option][3]]
                const newOptions = Object.keys(options)
                        .map(op => [op, op === option ? data : options[op]])
                update.setBtnOptions(Object.fromEntries(newOptions))
                Swal.fire('No es posible compartir pantalla')
            }
        },
        'screen-': () => { // Dejo de compartir pantalla
            document.querySelector(`.main-screen .screens`).style.opacity = '1'
            document.querySelector(`.main-screen .video-screen`).style.opacity = '0'
        },
        'phone-option-inactive': () => { // Salgo de la llamada
            navigate(`/outroom/${temp.roomID}`)
            window.location.reload()
        }
    }

    useEffect(() => {
        setUser(temp.user)
        setSocket(temp.socket)
        setOptionsCall(temp.optionsCall)
        setIsAdmin(temp.isAdmin)
        setUsers(temp.users)
        setIsShareScreen(temp.isShareScreen)
        setOptions(temp.btnOptions)
    }, [temp])

    useEffect(() => {
        if(user == null || isAdmin) return

        const { microphone, video } = options
        const newOptions = [
            [microphone[1], microphone[0], microphone[3], microphone[2]],
            [video[1], video[0], video[3], video[2]]
        ]
        if (optionsCall.microphone === '') options.microphone = newOptions[0] // Activo el audio
        if (optionsCall.video === '') options.video = newOptions[1] // Activo el video
        update.setBtnOptions(options)
    }, [user, isAdmin])

    useEffect(() => {
        if (socket == null || users.length === 0) return

        const handler = (data) => {
            update.lanzarNotificacion(data.user, " acaba de alzar la mano")
            update.raiseLowerHand(data.user.id, data.opacityHand)
        }
        socket.on('raise-lower-hand', handler)

        return () => {
            socket.off('raise-lower-hand', handler)
        }
    }, [socket, users])

    return (
        <div className='footer-section'>
            {Object.keys(options).map((option, index) => {
                const key = `${option}-${options[option][3]}`
                return (
                    <a id={option} onClick={() => {
                        const data = [options[option][1], options[option][0], options[option][3], options[option][2]]
                        const newOptions = Object.keys(options)
                                .map(op => [op, options[op]])
                                .fill([option, data], index, index + 1)
                        update.setBtnOptions(Object.fromEntries(newOptions))
                        functionOptions[key]()
                    }} className={options[option][2]} key={index}>
                        <FontAwesomeIcon icon={`fa-solid fa-${options[option][0]}`} />
                    </a>
                )
            })}
        </div>
    )
}

export default Options;
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { useRef, useState, useEffect } from "react";
import { useParams } from 'react-router-dom'
import logo from '../IMG/logo.png'
import CallPage from './callPage'
import OutRoom from './outRoom'
import { io } from 'socket.io-client'
import '../CSS/views/room.css'
import swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom';
import Loader from '../components/utils/loader'

library.add(faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash)

const randomColor = () => {
    const posibilities = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
    const size = posibilities.length
    let random_color = "#";

    for (let j = 0; j < 6; j++) {
        random_color += posibilities[Math.floor(Math.random() * size)]
    }

    return random_color;
}

const RoomPage = () => {
    const { roomID } = useParams()
    const userVideo = useRef();
    const [user, setUser] = useState()
    const [isAdmin, setIsAdmin] = useState(window.location.search === "?admin")
    const [showCallPage, setShowCallPage] = useState(false)
    const [microphone, setMicrophone] = useState('-slash')
    const [video, setVideo] = useState('-slash')
    const [isValidRoom, setIsValidRoom] = useState(true)
    const [socket, setSocket] = useState()
    const [users, setUsers] = useState([])
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [stream, setStream] = useState()
    const [isWaiting, setIsWaiting] = useState(false)

    const AudioVideoOptions = (key, isRoomPage) => {
        const activateStream = (isAudio, isVideo) => {
            navigator.mediaDevices.getUserMedia({ audio: isAudio, video: isVideo }).then(streamObject => {
                if (!stream) { // Si no hay nada activado, creo el stream
                    if (isRoomPage) userVideo.current.srcObject = streamObject;
                    setStream(streamObject)
                } else if (isAudio) { // Si esta activo el audio
                    if (isRoomPage) userVideo.current.srcObject.addTrack(streamObject.getAudioTracks()[0])
                    stream.addTrack(streamObject.getAudioTracks()[0])
                    setStream(stream)
                } else { // Si esta activo el video
                    if (isRoomPage) userVideo.current.srcObject.addTrack(streamObject.getVideoTracks()[0])
                    stream.addTrack(streamObject.getVideoTracks()[0])
                    setStream(stream)
                }
            })
        }
        const values = {
            "AUDIO ACTIVADO": () => activateStream(true, false),
            "AUDIO DESACTIVADO": () => {
                if (isRoomPage) {
                    userVideo.current.srcObject.getAudioTracks()[0].stop()
                    if (userVideo.current.srcObject.getTracks().length === 0) setStream(null)
                }
            },
            "VIDEO ACTIVADO": () => activateStream(false, true),
            "VIDEO DESACTIVADO": () => {
                if (isRoomPage) {
                    userVideo.current.srcObject.getVideoTracks()[0].stop()
                    if (userVideo.current.srcObject.getTracks().length === 0) setStream(null)
                }
            }
        }

        values[key]()
    }

    const setOptions = (options) => {
        setMicrophone(options.microphone)
        setVideo(options.video)
    }

    const changeAudio = () => {
        const btn = document.querySelector('.camera-options .btn-audio')
        const fontA = btn.firstChild
        if (microphone === '-slash') {
            AudioVideoOptions("AUDIO ACTIVADO", true)
            btn.style.backgroundColor = 'gray'
            fontA.setAttribute('color', 'white')
            setMicrophone('')
        } else {
            AudioVideoOptions("AUDIO DESACTIVADO", true)
            btn.style.backgroundColor = 'red'
            fontA.setAttribute('color', 'black')
            setMicrophone('-slash')
        }
    }

    const changeVideo = () => {
        const btn = document.querySelector('.camera-options .btn-video')
        const fontA = btn.firstChild
        if (video === '-slash') {
            AudioVideoOptions("VIDEO ACTIVADO", true)
            btn.style.backgroundColor = 'gray'
            fontA.setAttribute('color', 'white')
            setVideo('')
        } else {
            AudioVideoOptions("VIDEO DESACTIVADO", true)
            btn.style.backgroundColor = 'red'
            fontA.setAttribute('color', 'black')
            setVideo('-slash')
        }
    }

    const joinMeet = (e) => {
        e.preventDefault()
        user.name = username
        setUser(user)
        socket.emit('permises', { user, roomID })
        setIsWaiting(true)
    }

    // Conexion del websocket
    useEffect(() => {
        const URL = process.env.REACT_APP_URL
        const s = io(URL, { transports: ['websocket'] });
        setSocket(s);
        s.emit('room-exists', roomID)

        return () => {
            s.disconnect();
        }
    }, []);

    // Validar si la llamada ya tiene un admin
    useEffect(() => {
        if (socket == null || user == null || !isAdmin) return;

        const handler = () => {
            swal.fire('Ya existe un admin').then(() => {
                setUser(null)
                setIsAdmin(false)
                navigate(`/${roomID}`)
                window.location.reload()
            })
        }
        socket.on('admin-already-exists', handler);

        return () => {
            socket.off('admin-already-exists', handler);
        }

    }, [socket, user, isAdmin])

    // Reunion llena
    useEffect(() => {
        if (socket == null || isAdmin) return;

        const handler = () => swal.fire('Reunión llena').then(() => setIsWaiting(false))
        socket.on('room-full', handler);

        return () => {
            socket.off('room-full', handler);
        }

    }, [socket, isAdmin])

    // Validamos si la reunion existe
    useEffect(() => {
        if (socket == null) return;

        const handler = data => {
            setIsValidRoom(data.response || isAdmin)
            if (data.response || isAdmin) {
                const tempUser = {
                    id: data.socketID,
                    name: isAdmin ? "Admin" : "",
                    isAdmin, color: randomColor(),
                    opacityHand: '0'
                }
                if (isAdmin) socket.emit('join-room', { user: tempUser, roomID })
                setUser(tempUser)
                setUsers([tempUser])
            }
        }
        socket.on('room-exists', handler);

        return () => {
            socket.off('room-exists', handler);
        }

    }, [socket, isAdmin])

    // Administrador da acceso a la llamada
    useEffect(() => {
        if (socket == null || !isAdmin) return

        const handler = (res) => {
            swal.fire({
                title: `${res.name} esta pidiendo permisos para entrar a la llamada`,
                showConfirmButton: true,
                showCancelButton: true,
                showDenyButton: false,
                showCloseButton: false,
                confirmButtonText: 'Aceptar',
                cancelButtonText: 'Cancelar'
            }).then(r => {
                socket.emit('update-permises', { user: res, response: r.isConfirmed })
            })
        }
        socket.on('get-permises', handler)

        return () => {
            socket.off('get-permises', handler);
        }
    }, [socket, isAdmin])

    // Respuesta del administrador para el acceso a la llamada
    useEffect(() => {
        if (socket == null || isAdmin) return

        const handler = (res) => {
            setShowCallPage(res.response)
            setIsWaiting(false)
            if (!res.response) {
                swal.fire('Permiso denegado')
            } else {
                socket.emit('join-room', { user: res.user, roomID })
            }
        }
        socket.on('answer-permises', handler)

        return () => {
            socket.off('answer-permises', handler);
        }
    }, [socket, isAdmin])

    return (
        <>
            {isValidRoom ? (
                isAdmin ? (
                    user ? (
                        <CallPage temp={{
                            socket, roomID, isAdmin, user, users, stream,
                            optionsCall: { microphone, video }
                        }}
                            update={{ setIsAdmin, setUsers, setUser, setOptions }} />
                    ) : (
                        <Loader />
                    )
                ) : (
                    showCallPage ? (
                        <CallPage temp={{
                            socket, roomID, isAdmin, user, users, stream,
                            optionsCall: { microphone, video }
                        }}
                            update={{ setIsAdmin, setUsers, setUser, setOptions }} />
                    ) : (
                        isWaiting ? (
                            <Loader />
                        ) : (
                            <>
                                <nav>
                                    <a href="/"><img src={logo} /> <span>Meet</span></a>
                                </nav>
                                <section className="room-section">
                                    <div className="camera-options">
                                        <video className="room-video" muted ref={userVideo} autoPlay playsInline />
                                        <button onClick={changeAudio} className="btn-audio"><FontAwesomeIcon icon={`fa-solid fa-microphone${microphone}`} /></button>
                                        <button onClick={changeVideo} className="btn-video"><FontAwesomeIcon icon={`fa-solid fa-video${video}`} /></button>
                                    </div>
                                    <div className="values">
                                        <form onSubmit={joinMeet}>
                                            <h3>¿Cómo te llamas?</h3>
                                            <input onChange={e => setUsername(e.target.value)} required type="text" placeholder="Tu nombre" />
                                            <button type="submit">Solicitar unirse</button>
                                        </form>
                                    </div>
                                </section>
                            </>
                        )
                    )
                )
            ) : (
                <OutRoom temp={{ isPageNotFound: true }} />
            )}
        </>
    )
};

export default RoomPage;
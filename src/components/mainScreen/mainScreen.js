import Screen from './screen'
import '../../CSS/mainScreen/mainScreen.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import Peer from "simple-peer";

const MainScreen = ({ temp, update }) => {
    const videoScreen = useRef()
    const peersRef = useRef([])
    const peersScreenRef = useRef([])
    const [users, setUsers] = useState(temp.users)
    const [optionsCall, setOptionsCall] = useState(temp.optionsCall)
    const [stream, setStream] = useState(temp.stream)
    const [contador, setContador] = useState(0)
    const [isAdmin, setIsAdmin] = useState(temp.isAdmin)
    const [user, setUser] = useState(temp.user)
    const [peerScreen, setPeerScreen] = useState()
    const [socket, setSocket] = useState(temp.socket)
    const [isShareScreen, setIsShareScreen] = useState(temp.isShareScreen)
    const [btnOptions, setBtnOptions] = useState(temp.btnOptions)
    const [streamScreen, setStreamScreen] = useState()

    const createPeer = useCallback((stream, u) => {
        const tempStream = stream == null ? new MediaStream() : stream
        const peer = new Peer({ initiator: true, trickle: false, stream: tempStream });

        peer.on("signal", signal => {
            socket.emit("sending-signal", { socketID: u.id, data: { user, signal } })
        })

        return peer
    }, [user, socket])

    const addPeer = useCallback((data, stream) => {
        update.lanzarNotificacion(data.user, " acaba de entrar a la reunión")
        const tempStream = stream == null ? new MediaStream() : stream
        const peer = new Peer({ initiator: false, trickle: false, stream: tempStream })

        peer.on("signal", signal => {
            socket.emit("returning-signal", { socketID: data.user.id, data: { user, signal } })
        })

        peer.signal(data.signal);
        return peer
    }, [socket, update, user])

    const createPeerScreen = useCallback((stream, u) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on("signal", signal => {
            socket.emit("on-signal-screen", { socketID: u.id, data: { user, signal } })
        })

        return peer;
    }, [socket, user])

    const addPeerScreen = useCallback((data) => {
        update.lanzarNotificacion(data.user, " está compartiendo pantalla")
        const peer = new Peer({ initiator: false, trickle: false })

        peer.on('signal', signal => {
            socket.emit('returning-signalScreen', { socketID: data.user.id, data: { user, signal } })
        })

        peer.on('stream', streamObject => {
            console.log(data.user.name + " is sharing his/her screen")
            setStreamScreen(streamObject)
            setPeerScreen({ user: data.user, peer })
            videoScreen.current.srcObject = streamObject
            update.setIsShareScreen(true)
            document.querySelector(`.main-screen .screens`).style.opacity = '0'
            document.querySelector(`.main-screen .video-screen`).style.opacity = '1'
        })

        peer.signal(data.signal);
    }, [socket, update, user])

    // Pido permisos para compartir pantalla
    const shareScreen = useCallback(() => {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(streamObject => {
            update.lanzarNotificacion(user, " (Tú) está compartiendo pantalla")
            users.filter(u => user.id !== u.id).forEach(u => {
                const peer = createPeerScreen(streamObject, u)
                peersScreenRef.current.push({ user: u, peer })
            })
            videoScreen.current.srcObject = streamObject
            setStreamScreen(streamObject)
            update.setIsShareScreen(true)
            // Si se deja de compartir pantalla
            streamObject.getVideoTracks()[0].addEventListener('ended', () => {
                document.getElementById('screen').click()
            })
        }).catch(() => {
            document.getElementById('screen').click()
        })
    }, [createPeerScreen, update, user, users])

    const AudioVideoOptions = (key, userVideoRef) => {
        const activateStream = (isAudio, isVideo) => {
            navigator.mediaDevices.getUserMedia({ audio: isAudio, video: isVideo }).then(streamObject => {
                if (!stream) { // Si no hay nada activado, creo el stream
                    setStream(streamObject)
                    peersRef.current.forEach(peer => {
                        peer.peer.addStream(streamObject)
                    })
                } else if (isAudio) { // Si esta activo el audio
                    stream.addTrack(streamObject.getAudioTracks()[0])
                    setStream(stream)
                    peersRef.current.forEach(peer => {
                        peer.peer.addTrack(streamObject.getAudioTracks()[0], userVideoRef.current.srcObject)
                    })
                } else { // Si esta activo el video
                    stream.addTrack(streamObject.getVideoTracks()[0])
                    setStream(stream)
                    peersRef.current.forEach(peer => {
                        peer.peer.addTrack(streamObject.getVideoTracks()[0], userVideoRef.current.srcObject)
                    })
                }
            })
        }
        const values = {
            "AUDIO ACTIVADO": () => activateStream(true, false),
            "AUDIO DESACTIVADO": () => {
                const streamObject = userVideoRef.current.srcObject
                const condicion = streamObject.getVideoTracks().length === 0
                peersRef.current.forEach(peer => {
                    if (condicion) {
                        peer.peer.removeStream(streamObject)
                    } else {
                        peer.peer.removeTrack(streamObject.getAudioTracks()[0], streamObject)
                    }
                })
                streamObject.getAudioTracks()[0].stop()
                if(condicion) setStream(null)
                socket.emit('off-audio', user)
            },
            "VIDEO ACTIVADO": () => activateStream(false, true),
            "VIDEO DESACTIVADO": () => {
                const streamObject = userVideoRef.current.srcObject
                const condicion = streamObject.getAudioTracks().length === 0
                peersRef.current.forEach(peer => {
                    if (condicion) {
                        peer.peer.removeStream(streamObject)
                    } else {
                        peer.peer.removeTrack(streamObject.getVideoTracks()[0], streamObject)
                    }
                })
                streamObject.getVideoTracks()[0].stop()
                if(condicion) setStream(null)
                socket.emit('off-video', user)
            }
        }

        values[key]()
    }

    useEffect(() => {
        setUsers(temp.users)
        setOptionsCall(temp.optionsCall)
        setStream(temp.stream)
        setIsAdmin(temp.isAdmin)
        setUser(temp.user)
        setSocket(temp.socket)
        setIsShareScreen(temp.isShareScreen)
        setBtnOptions(temp.btnOptions)
    }, [temp])

    useEffect(() => {
        if(peersRef.current.length === 0 || users.length === 0 || stream == null 
            || optionsCall == null || contador !== 0 || isAdmin) return

        if(optionsCall.microphone === '') update.initVideo("AUDIO ACTIVADO")
        if(optionsCall.video === '') update.initVideo("VIDEO ACTIVADO")
        setContador(contador + 1)
    }, [users, optionsCall, stream, contador, isAdmin, update])

    // Obtengo los usuarios
    useEffect(() => {
        if (socket == null || user == null || users.length === 0) return

        const handler = (usersInThisRoom) => {
            update.setUsers([...users, ...usersInThisRoom])
            usersInThisRoom.forEach(u => {
                const peer = createPeer(stream, u)
                peersRef.current.push({ user: u, peer })
            })
        }
        socket.on('all-users', handler)

        return () => {
            socket.off('all-users', handler)
        }
    }, [socket, user, stream, users, createPeer, update])

    // Usuario desconectado
    useEffect(() => {
        if (socket == null || user == null || users.length === 0) return

        const handler = (data) => {
            update.lanzarNotificacion(data.user, " acaba de salir de la reunión")
            const usersT = users.filter(u => u.id !== data.user.id)
            update.setUsers(usersT)
            if(data.newAdmin) {
                update.setIsAdmin(user.id === data.newAdmin.id)
                update.setUser(user.id === data.newAdmin.id ? data.newAdmin : user)
                const indice = usersT.indexOf(user)
                update.setUsers(usersT.fill(data.newAdmin, indice, indice + 1))
            }
            peersRef.current = peersRef.current.filter(p => p.user.id !== data.user.id)
            peersScreenRef.current = peersScreenRef.current.filter(p => p.user.id !== data.user.id)
            if (isShareScreen && peerScreen) {
                if(peerScreen.user.id === data.user.id) {
                    streamScreen.getTracks().forEach(track => track.stop())
                    videoScreen.current.srcObject.getTracks().forEach(track => track.stop())
                    peerScreen.peer.destroy()
                    setStreamScreen(null)
                    videoScreen.current.srcObject = null
                    setPeerScreen(null)
                    update.setIsShareScreen(false)
                    document.querySelector(`.main-screen .screens`).style.opacity = '1'
                    document.querySelector(`.main-screen .video-screen`).style.opacity = '0'
                }
            }
        }
        socket.on('out-room', handler)
        
        return () => {
            socket.off('out-room', handler)
        } 
    }, [socket, streamScreen, update, user, users, isShareScreen, peerScreen])

    // Recibo una señal
    useEffect(() => {
        if(socket === null || user === null || users.length === 0) return

        const handler = (data) => {
            const tempPeer = peersRef.current.find(p => p.user.id === data.user.id)
            if (tempPeer) {
                tempPeer.peer.signal(data.signal)
            } else {
                const peer = addPeer(data, stream)
                peersRef.current.push({ user: data.user, peer })
                update.setUsers([...users, data.user])
                if((peersScreenRef.current.length > 0 || (peersScreenRef.current.length === 0 && isAdmin && streamScreen)) && !peerScreen) { // Si esta compartiendo pantalla
                    const peer = createPeerScreen(streamScreen, data.user)
                    peersScreenRef.current.push({ user: data.user, peer })
                }
            }
        }
        socket.on('receiving-signal', handler)
        
        return () => {
            socket.off('receiving-signal', handler)
        }
    }, [socket, update, user, createPeerScreen, peerScreen, stream, addPeer, users, isAdmin, streamScreen])

    // Retorno de señal
    useEffect(() => {
        if(socket == null) return;

        const handler = (data) => {
            const peer = peersRef.current.find(p => p.user.id === data.user.id)
            peer.peer.signal(data.signal)
        }
        socket.on('receiving-returned-signal', handler)
        
        return () => {
            socket.off('receiving-returned-signal', handler)
        }
    }, [socket])

    // Compartir pantalla
    useEffect(() => {
        if (btnOptions == null || user == null || users.length === 0) return;
        
        const screen = document.getElementById('screen')
        const handler = () => {
            if(btnOptions.screen[2] === 'option-active') {
                peersScreenRef.current.forEach(p => {
                    p.peer.removeStream(videoScreen.current.srcObject)
                    p.peer.destroy()
                })
                streamScreen.getTracks().forEach(track => track.stop())
                peersScreenRef.current = []
                setStreamScreen(null)
                videoScreen.current.srcObject = null
                update.setIsShareScreen(false)
                socket.emit('off-screen', user)
            } else {
                shareScreen()
            }
        }
        screen.addEventListener('click', handler)

        return () => {
            screen.removeEventListener('click', handler)
        }
    }, [socket, update, btnOptions, streamScreen, shareScreen, user, users])

    // Alguien comparte pantalla
    useEffect(() => {
        if (socket == null || user == null) return;

        const handler = (data) => addPeerScreen(data)
        socket.on('on-screen', handler)

        return () => {
            socket.off('on-screen', handler)
        }
    }, [socket, user, addPeerScreen])

    // Recibo las signals de todos los usuarios
    useEffect(() => {
        if (socket == null) return;

        const handler = (data) => {
            const peerScreen = peersScreenRef.current.find(ps => ps.user.id === data.user.id);
            peerScreen.peer.signal(data.signal)
        }
        socket.on('receiving-returning-signalScreen', handler)

        return () => {
            socket.off('receiving-returning-signalScreen', handler)
        }
    }, [socket])

    // Dejar de mostrar la pantalla compartida
    useEffect(() => {
        if (socket == null || peerScreen == null || streamScreen == null) return;

        const handler = () => {
            streamScreen.getTracks().forEach(track => track.stop())
            videoScreen.current.srcObject.getTracks().forEach(track => track.stop())
            peerScreen.peer.destroy()
            setStreamScreen(null)
            videoScreen.current.srcObject = null
            setPeerScreen(null)
            update.setIsShareScreen(false)
            document.querySelector(`.main-screen .screens`).style.opacity = '1'
            document.querySelector(`.main-screen .video-screen`).style.opacity = '0'
        }
        socket.on('off-screen', handler)

        return () => {
            socket.off('off-screen', handler)
        }
    }, [socket, update, peerScreen, streamScreen])

    return (
        <ul className='main-screen'>
            <li className='video-screen'>
                <video id="screen-share" ref={videoScreen} autoPlay playsInline />
            </li>
            <li className='screens'>
                <Screen temp={{ user, stream, muted: true, 
                    btnOptions, socket, peersRef: peersRef.current }} 
                    update={{ AudioVideoOptions }} />
                {peersRef.current.map((peer, index) => {
                    return <Screen key={index} temp={{ peer: peer.peer, user: peer.user, muted: false }} />
                })}
            </li>
        </ul>
    )
}

export default MainScreen;
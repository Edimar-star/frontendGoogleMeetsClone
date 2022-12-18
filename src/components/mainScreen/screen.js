import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from 'react';
import '../../CSS/mainScreen/screen.css'

library.add(faUser)

const Screen = ({ temp, update }) => {
    const [user, setUser] = useState(temp.user)
    const [peer, setPeer] = useState(temp.peer)
    const [stream, setStream] = useState(temp.stream)
    const [muted, setMuted] = useState(temp.muted)
    const [btnOptions, setBtnOptions] = useState(temp.btnOptions)
    const [socket, setSocket] = useState(temp.socket)
    const peersRef = useRef(temp.peersRef)
    const videoRef = useRef()

    useEffect(() => {
        setUser(temp.user)
        setPeer(temp.peer)
        setStream(temp.stream)
        setMuted(temp.muted)
        setBtnOptions(temp.btnOptions)
        setSocket(temp.socket)
        peersRef.current = temp.peersRef
    }, [temp])

    useEffect(() => {
        if (peer == null || user == null) return;

        const handler = streamObject => {
            videoRef.current.srcObject = streamObject
            if(streamObject.getAudioTracks().length === 1) document.querySelector(`#screen-${user.id} section svg`).style.opacity = '1'
            if(streamObject.getVideoTracks().length === 1) {
                document.querySelector(`#screen-${user.id} ul .default-video`).classList.remove('video-active')
                document.querySelector(`#screen-${user.id} ul .user-video`).classList.add('video-active')
            }
        }
        peer.on('stream', handler)

        return () => {
            peer.off('stream', handler)
        }
    }, [peer, user]);

    useEffect(() => {
        if (peer == null || user == null) return;

        const handler = track => {
            if(videoRef.current.srcObject != null) {
                videoRef.current.srcObject.addTrack(track);
                if(track.kind === 'audio') document.querySelector(`#screen-${user.id} section svg`).style.opacity = '1'
                if(track.kind === 'video') {
                    document.querySelector(`#screen-${user.id} ul .default-video`).classList.remove('video-active')
                    document.querySelector(`#screen-${user.id} ul .user-video`).classList.add('video-active')
                }
            } 
        }
        peer.on('track', handler)

        return () => {
            peer.off('track', handler)
        }
    }, [peer, user]);

    useEffect(() => {
        if(stream == null) return;

        videoRef.current.srcObject = stream;
    }, [stream])

    // Activo el audio
    useEffect(() => {
        if (btnOptions == null || socket == null || peersRef.current === 0) return;

        const handler = () => {
            const key = btnOptions.microphone[2] === 'option-inactive' ? '' : 'DES'
            update.AudioVideoOptions(`AUDIO ${key}ACTIVADO`, videoRef)
        }
        document.getElementById('microphone').addEventListener('click', handler)

        return () => {
            document.getElementById('microphone').removeEventListener('click', handler)
        }
    }, [stream, btnOptions, socket, peersRef.current, videoRef.current])

    // Activo el video
    useEffect(() => {
        if (btnOptions == null || socket == null || peersRef.current === 0) return;

        const handler = () => {
            const key = btnOptions.video[2] === 'option-inactive' ? '' : 'DES'
            update.AudioVideoOptions(`VIDEO ${key}ACTIVADO`, videoRef)
        }
        document.getElementById('video').addEventListener('click', handler)

        return () => {
            document.getElementById('video').removeEventListener('click', handler)
        }
    }, [stream, btnOptions, socket, peersRef.current, videoRef.current])

    // Desactivo el audio de un usuario remoto
    useEffect(() => {
        if (socket == null) return;

        const handler = user => document.querySelector(`#screen-${user.id} section svg`).style.opacity = '0'
        socket.on('off-audio', handler)

        return () => {
            socket.off('off-audio', handler);
        }
    }, [socket])

    // Desactivo el video de un usuario remoto
    useEffect(() => {
        if (socket == null) return;

        const handler = user => {
            document.querySelector(`#screen-${user.id} ul .user-video`).classList.remove('video-active')
            document.querySelector(`#screen-${user.id} ul .default-video`).classList.add('video-active')
        }
        socket.on('off-video', handler)

        return () => {
            socket.off('off-video', handler);
        }
    }, [socket])

    return (
        <>
            {user && (
                <div id={'screen-' + user.id} className='screen'>
                    <ul>
                        <li className='default-video video-active'>
                            <span style={{ backgroundColor: user.color }}>
                                <FontAwesomeIcon icon="fa-solid fa-user" />
                            </span>
                        </li>
                        <li className='user-video'>
                            <video ref={videoRef} muted={muted} autoPlay playsInline />
                        </li>
                    </ul>
                    <section>
                        <FontAwesomeIcon icon='fa-solid fa-microphone' />
                        <p>{user.name}</p>
                    </section>
                </div>
            )}
        </>
    );
}

export default Screen;
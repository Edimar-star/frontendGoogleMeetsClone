import '../../CSS/utils/createRoom.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faVideo, faKeyboard } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v1 as uuid } from "uuid";

library.add(faVideo, faKeyboard)

const CreateRoom = () => {
    const navigate = useNavigate()
    const [code, setCode] = useState("")

    const createMeet = (e) => {
        e.preventDefault()
        const roomID = uuid().split('-').slice(0, 3).toString().replaceAll(',', '-')
        navigate(`/${roomID}?admin`)
    }

    const joinMeet = (e) => {
        e.preventDefault()
        navigate(`/${code}`)
    }

    return (
        <div className="container create-room">
            <h1>Videoconferencias premium. 
                Ahora gratis para todos</h1>
            <p>Rediseñamos Google Meet, nuestro 
                servicio de reuniones de negocios 
                seguras, de modo que sea gratuito 
                y esté disponible para todos.</p>
            <div className="form-create-room">
                <form onSubmit={createMeet} >
                    <button type='submit' className="new-meet"><FontAwesomeIcon icon="fa-solid fa-video" /> Reunión nueva</button>
                </form>
                <form onSubmit={joinMeet} className="div-form">
                    <div className="div-input">
                        <FontAwesomeIcon icon="fa-solid fa-keyboard" />
                        <input required onChange={e => setCode(e.target.value)} type="text" placeholder="Ingresa un código" />
                    </div>
                    <button className="join-room" type='submit'>Unirse</button>
                </form>
            </div>
        </div>
    )
};

export default CreateRoom;
import '../CSS/views/outRoom.css'
import { useNavigate, useParams } from 'react-router-dom';
import { v1 as uuid } from "uuid";
import { useEffect, useRef, useState } from 'react';

const SAVE_INTERVAL_MS = 1000;
const ROOM_ID = uuid().split('-')
    .map((elements, index) => elements.split('')
        .map(element => ['x', 'y', 'z'][index])
        .slice(0, elements.length).toString()
        .replaceAll(',', ''))
    .slice(0, 3).toString().replaceAll(',', '-')

const OutRoom = ({ temp }) => {
    const navigate = useNavigate()
    const { roomID } = useParams()
    const timeInterval = useRef(59)
    const [time, setTime] = useState(timeInterval.current)

    useEffect(() => {
        const interval = setInterval(() => {
            timeInterval.current -= 1
            setTime(timeInterval.current)
            if(timeInterval.current === 0) navigate('/')
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval);
        }
    }, [timeInterval, navigate])

    return (
        <div className='outroom'>
            <nav>
                <div>{time}</div>
                <h4>Volviendo a la pantalla principal</h4>
            </nav>
            <div className='outroom-content'>
                {temp.isPageNotFound ? (
                    <div>
                        <h2>Verifica el código de reunión</h2>
                        <p>
                            Asegúrate de haber ingresado el código de
                            reunión correcto en la URL: por ejemplo: 
                            {` ${window.location.origin}/`}
                            <b>{ROOM_ID}</b>
                        </p>
                    </div>
                ) : (
                    <div>
                        <h2>Abandonaste la reunión</h2>
                    </div>
                )}
                <div>
                    {!temp.isPageNotFound && (
                        <button onClick={() => navigate(`/${roomID}`)} className='return'>
                            Volver a unirse
                        </button>
                    )}
                    <button onClick={() => navigate('/')} >Volver a la pantalla principal</button>
                </div>
            </div>
        </div>
    )
}

export default OutRoom;
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import swal from 'sweetalert2'
import '../../CSS/utils/loader.css'

const SAVE_INTERVAL_MS = 1000;

const Loader = () => {
    const navigate = useNavigate()
    const timeInterval = useRef(59)

    useEffect(() => {
        const interval = setInterval(() => {
            timeInterval.current -= 1
            if(timeInterval.current === 0) swal.fire('No pudimos conectar a la reunión').then(() => {
                navigate('/')
                window.location.reload()
            })
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval);
        }
    }, [timeInterval, navigate])

    return (
        <div className='loader'>
            <h2>Intentando conectar a la reunión espere...</h2>
            <div className='spinner'></div>
        </div>
    )
}

export default Loader;
import '../../CSS/panel/infoMeet.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

library.add(faCopy)

const InfoMeet = ({ temp, update }) => {

    return (
        <li id="infoMeet">
            <section>
                <h3>Detalles de la reunión</h3>
            </section>
            <div className='contenido'>
                <h4>Información para unirse</h4>
                <p>{`${window.location.origin}/${temp.roomID}`}</p>
                <button onClick={update.copyLink}>
                    <FontAwesomeIcon icon="fa-solid fa-copy" /> 
                    Copiar información para unirse a la llamada
                </button>
            </div>
        </li>
    )
}

export default InfoMeet;
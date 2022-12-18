import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faClose, faCopy, faUserFriends, faLock } from "@fortawesome/free-solid-svg-icons";
import '../../CSS/utils/modal.css'

library.add(faClose, faCopy, faUserFriends, faLock)

const Modal = ({ temp, update }) => {

    return (
        <div className='modal'>
            <section>
                <h3>La reunion está lista</h3>
                <button onClick={e => document.querySelector('.modal').style.visibility = 'hidden'}>
                    <FontAwesomeIcon icon="fa-solid fa-close" />
                </button>
            </section>
            <form onSubmit={update.sendEmail} >
                <button type='submit' className='add-people'>
                    <FontAwesomeIcon icon="fa-solid fa-user-friends" /> Agrega a otras personas
                </button>
            </form>
            <p>
                O comparte este vinculo de reunión con otras
                personas que quieres que participen en ella
            </p>
            <section>
                <h5 id="copylink">{`${window.location.origin}/${temp.roomID}`}</h5>
                <button onClick={update.copyLink}><FontAwesomeIcon icon="fa-solid fa-copy" /></button>
            </section>
            <section>
                <FontAwesomeIcon icon="fa-solid fa-lock" />
                <p>
                    Las personas que usen este vinculo de reunión
                    deben obtener tu permiso para unirse a ella.
                </p>
            </section>
            <p>Te uniste como Admin</p>
        </div>
    )
}

export default Modal;
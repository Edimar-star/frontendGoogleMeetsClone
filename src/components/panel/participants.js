import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import '../../CSS/panel/participants.css'
import { useEffect, useState } from 'react';

library.add(faUserPlus, faUser)

const Participants = ({ temp, update }) => {
    const [users, setUsers] = useState(temp.users)
    const [visibleUsers, setVisibleUsers] = useState(temp.users)
    const [isAdmin, setIsAdmin] = useState(temp.isAdmin)
    const [username, setUsername] = useState('')

    useEffect(() => {
        setUsers(temp.users)
        setIsAdmin(temp.isAdmin)
    }, [temp])

    useEffect(() => {
        setVisibleUsers(users.filter(u => u.name.includes(username)))
    }, [users, username])

    return (
        <li id="participants">
            <section>
                <h3>Personas</h3>
                <form onSubmit={update.sendEmail} >
                    { isAdmin && ( 
                        <button type='submit'>
                            <FontAwesomeIcon icon="fa-solid fa-user-plus" /> Agregar personas
                        </button>
                    )}
                </form>
                <input onChange={e => setUsername(e.target.value)} placeholder="Buscar participantes" />
                <h4>En la llamada</h4>
            </section>
            <div className='contenido'>
                {visibleUsers.map((user, index) => {
                    return (
                        <div id={'participant-' + user.id} key={index}>
                            <span style={{ backgroundColor: user.color }}>
                                <FontAwesomeIcon icon="fa-solid fa-user" />
                            </span>
                            <section>
                                <p>{user.name}</p>
                                <FontAwesomeIcon style={{ opacity: user.opacityHand }} icon="fa-solid fa-hand" />
                            </section>
                        </div>
                    )
                })}
            </div>
        </li>
    )
}

export default Participants;
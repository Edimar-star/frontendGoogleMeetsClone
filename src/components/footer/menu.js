import Chat from '../panel/chat'
import Participants from '../panel/participants';
import InfoMeet from '../panel/infoMeet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCircleInfo, faUserFriends, faMessage } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from 'react';
import '../../CSS/footer/menu.css'

library.add(faCircleInfo, faUserFriends, faMessage)

const Menu = ({ temp, update }) => {
    const [user, setUser] = useState(temp.user)
    const [users, setUsers] = useState(temp.users)
    const [socket, setSocket] = useState(temp.socket)
    const [isAdmin, setIsAdmin] = useState(temp.isAdmin)
    const [options, setOptions] = useState({
        info: ['circle-info', '', 'option-active', '#infoMeet'],
        users: ['user-friends', '', 'option-active', '#participants'],
        message: ['message', '', 'option-active', '#chat'],
    })

    useEffect(() => {
        setUsers(temp.users)
        setSocket(temp.socket)
        setIsAdmin(temp.isAdmin)
        setUser(temp.user)
    }, [temp])

    return (
        <div className='footer-section options-right'>
            {Object.keys(options).map((option, index) => {
                return (
                    <a href={options[option][3]} onClick={() => {
                        const arrayOptions = Object.keys(options)
                        const isActive = arrayOptions.find(element => options[element][1] === 'option-active')
                        const menu = document.querySelector('.all-options')
                        const allOptions = document.querySelector('.main-screen')
                        if(!isActive) {
                            menu.style.visibility = 'visible'
                            allOptions.classList.add('main-screen-collapse')
                        } else if (isActive === option) {
                            menu.style.visibility = 'hidden'
                            allOptions.classList.remove('main-screen-collapse')
                        }
                        const data = [options[option][0], options[option][2], options[option][1], options[option][3]]
                        const newOptions = arrayOptions.map(op => {
                            const temp = [options[op][0], '', 'option-active', options[op][3]]
                            return [op, op === option ? data : temp]
                        })
                        setOptions(Object.fromEntries(newOptions))
                    }} className={options[option][1]} key={index}>
                        <FontAwesomeIcon icon={`fa-solid fa-${options[option][0]}`} />
                    </a>
                )
            })}
            <ul className='all-options'>
                <InfoMeet update={{ copyLink: update.copyLink }} temp={{ roomID: temp.roomID }} />
                <Participants update={{ sendEmail: update.sendEmail }} temp={{ socket, users, isAdmin }} />
                <Chat temp={{ user, socket }} />
            </ul>
            <div id="toasts"></div>
        </div>
    )
}

export default Menu;
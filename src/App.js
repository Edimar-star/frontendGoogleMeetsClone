import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './views/homePage'
import RoomPage from './views/roomPage'
import OutRoom from './views/outRoom'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/:roomID" element={<RoomPage />} />
                <Route path="/outroom/:roomID" element={<OutRoom temp={{ isPageNotFound: false }} />} />
                <Route path="*" exact element={<OutRoom temp={{ isPageNotFound: true }} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
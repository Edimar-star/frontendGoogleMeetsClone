import '../CSS/views/home.css'
import CreateRoom from '../components/utils/createRoom';
import fondo from '../IMG/fondo.svg'
import logo from '../IMG/logo.png'

const HomePage = () => {
    return (
        <>
            <nav>
                <a href="/"><img src={logo} /> <span>Meet</span></a>
            </nav>

            <main>
                <CreateRoom />
                <div className="container container-img">
                    <img src={fondo} />
                    <section>
                        <h2>Obtén un vinculo para compartir</h2>
                        <p>Haz clic en <b>Nueva reunión </b>
                        para obtener un vínculo que puedas 
                        enviar a las personas con quienes 
                        quieras reunirte</p>
                    </section>
                </div>
            </main>
        </>
    )
};

export default HomePage;
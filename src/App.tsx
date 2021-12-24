import { Routes, Route } from 'react-router-dom'
import Game from './views/Game'
import GameOver from './views/GameOver'

const App = () => {
    return (
        <Routes>
            <Route path='/' element={<Game />} />
            <Route path='gameover' element={<GameOver />} />
        </Routes>
    )
}

export default App

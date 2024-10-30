import Home from './pages/Home'
import Dev from './pages/Dev'
import LoginPage from './pages/LoginPage'

import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { useState } from 'react'

function App() {
    const [appState, setAppState] = useState('login')

    const onLogin = function (key) {
        if (key === process.env.REACT_APP_LOGIN_PASSWORD) setAppState('chat')
    }

    return (
        <div>
            {appState === 'login' ? (
                <LoginPage onLogin={onLogin} />
            ) : (
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/Dev" element={<Dev />} />
                        <Route path="*" element={<h1>404</h1>} />
                    </Routes>
                </BrowserRouter>
            )}
        </div>
    )
}

export default App

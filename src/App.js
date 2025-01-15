import Home from './pages/Home'
import Dev from './pages/Dev'
import Dev2 from './pages/Dev2'
import LoginPage from './pages/LoginPage'

import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { createContext, useState, useEffect } from 'react'

export const AppContext = createContext();

function App() {
    const [appState, setAppState] = useState('login')
    const [studentWhitelist, setStudentWhitelist] = useState([])
    const [parentWhitelist, setParentWhitelist] = useState([])

    useEffect(() => {
        fetch(process.env.REACT_APP_GET_SHEET_DATA, { method: 'GET' })
            .then((response) => response.json())
            .then((json) => {
                if (!json?.valueRanges?.[2]?.values) {
                    return;
                }

                const cleanNames = (names) => {
                    return [...new Set(
                        names
                            .flat()
                            .filter((name) => name?.replace(/[^a-zA-Z0-9 ]/g, '').trim() !== '')
                    )];
                };

                const jsonRange = json.valueRanges[2].values;
                
                const studentNames = cleanNames(jsonRange.map((row) => [row[0]]));
                setStudentWhitelist(studentNames);

                const parentNames = cleanNames(jsonRange.map((row) => row.slice(2, 8)));
                setParentWhitelist(parentNames);
            });
    }, []);

    const onLogin = function (key) {
        if (key === process.env.REACT_APP_LOGIN_PASSWORD) setAppState('chat')
    }

    return (
        <AppContext.Provider value={[ studentWhitelist, parentWhitelist ]}>
            <div>
                {appState === 'NOTlogin' ? (
                    <LoginPage onLogin={onLogin} />
                ) : (
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/Dev" element={<Dev />} />
                            <Route path="/Dev2" element={<Dev2 />} />
                            <Route path="*" element={<h1>404</h1>} />
                        </Routes>
                    </BrowserRouter>
                )}
            </div>
        </AppContext.Provider>
    )
}

export default App

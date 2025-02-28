import Home from './pages/Home/Home.js'
import Dev from './pages/Dev/Dev.js'
import LoginPage from './pages/Login/LoginPage.js'

import { Route, Routes, BrowserRouter } from 'react-router-dom'
import { createContext, useState, useEffect } from 'react'

export const AppContext = createContext();

function App() {
    const [appState, setAppState] = useState('login')
    const [studentWhitelist, setStudentWhitelist] = useState([])
    const [parentWhitelist, setParentWhitelist] = useState([])
    const [studentHashmap, setStudentHashmap] = useState({})

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
                
                const studentNames = cleanNames(jsonRange.map((row) => row[0]));
                setStudentWhitelist(studentNames);
                setStudentHashmap(Object.fromEntries(jsonRange.map(([name, group]) => [name, group])));
                
                const parentNames = cleanNames(jsonRange.map((row) => row.slice(2, 8)));
                setParentWhitelist(parentNames);
            });
    }, []);

    const onLogin = function (key) {
        if (key === process.env.REACT_APP_LOGIN_PASSWORD) setAppState('app')
    }

    return (
        <AppContext.Provider value={[ studentWhitelist, parentWhitelist, studentHashmap ]}>
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
        </AppContext.Provider>
    )
}

export default App

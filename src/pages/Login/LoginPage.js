import React, { useState } from 'react'
import './LoginPage.css'

function LoginPage(props) {
    const [input, setInput] = useState('')

    const onChange = (evt) => {
        setInput(evt.target.value)
        if (
            evt.target.value.toLowerCase() ===
            process.env.REACT_APP_LOGIN_PASSWORD
        )
            props.onLogin(process.env.REACT_APP_LOGIN_PASSWORD)
    }

    return (
        <div className="login-page-container">
            <h4>Log in to Patribots Sign In</h4>
            <input
                type="password"
                placeholder="Enter password..."
                value={input}
                onChange={onChange}
            />
        </div>
    )
}

export default LoginPage

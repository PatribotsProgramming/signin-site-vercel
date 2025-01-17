import { useState, useRef, useEffect } from 'react'
import './AutoComplete.css'

const AutoComplete = ({ whitelist, onSubmit, devSite = false }) => {
    const fuzzysort = require('fuzzysort')

    // Example: whitelist = ['Emiliano Mendez Rosas', 'John Doe', 'Jane Doe']
    // Becomes: whitelist = [{first: 'Emiliano', rest: 'Mendez Rosas', fullName: 'Emiliano Mendez Rosas'}, ...]
    // This is so we can give a first name priority in the fuzzy search
    whitelist = whitelist.map((el) => {
        let [first, ...rest] = el.split(/ (.+)/)
        return { first: first, rest: rest.join(' '), fullName: el }
    })

    const [value, setValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)

    const [autoCompleteValue, setRealAutoCompleteValue] = useState('')

    const setAutoCompleteValue = (
        name,
        index = activeSuggestionIndex,
        filter = suggestions
    ) => {
        let ghostText =
            name !== '' ? name + (filter[index] || '').slice(name.length) : ''
        setRealAutoCompleteValue(ghostText)
    }

    const keyDownHandler = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                const newIndexDown =
                    activeSuggestionIndex + 1 < suggestions.length
                        ? activeSuggestionIndex + 1
                        : 0
                setActiveSuggestionIndex(newIndexDown)
                setAutoCompleteValue(value, newIndexDown)
                e.preventDefault()
                break
            case 'ArrowUp':
                const newIndexUp =
                    activeSuggestionIndex - 1 >= 0
                        ? activeSuggestionIndex - 1
                        : suggestions.length - 1
                setActiveSuggestionIndex(newIndexUp)
                setAutoCompleteValue(value, newIndexUp)
                e.preventDefault()
                break
            case 'Tab':
            case 'Enter':
                if (value === '') {
                    e.preventDefault()
                    return
                }
                setValue(suggestions[activeSuggestionIndex] || '')
                setShowSuggestions(false)
                // Send the ref and give the code time to access
                // the value since it was just updated
                setTimeout(() => {
                    onSubmit(autoCompleteRef)
                }, 10)
                if (devSite) {
                    break
                }
            // eslint-disable-next-line no-fallthrough
            case 'Escape':
                // in case the above case was just triggered,
                // wait a bit before clearing the value
                // so that it can be sent to onSubmit
                setTimeout(() => {
                    setValue('')
                    setAutoCompleteValue('')
                }, 10)
                setShowSuggestions(false)
                e.preventDefault()
                break
            default:
        }
    }

    const onChange = (e) => {
        setValue(e.target.value)

        // Below is the integration of https://github.com/farzher/fuzzysort
        // It first splits the

        // Give priority to first name matches, then last name matches, then full name matches
        const calculateScore = (a) => {
            return (
                (a[0] ? a[0].score : 0) +
                (a[1] ? a[1].score - 10 : 0) +
                (a[2] ? a[2].score : -1001)
            )
        }

        // Only filter if the input is alphanumeric
        const filter = e.target.value.match(/[a-z0-9]/i)
            ? fuzzysort
                  .go(e.target.value, whitelist, {
                      threshold: -1000,
                      limit: 5,
                      keys: ['first', 'rest', 'fullName'],
                      scoreFn: calculateScore,
                  })
                  .map((el) => el.obj.fullName)
            : []

        setSuggestions(filter)
        if (filter.length > 0) {
            setShowSuggestions(true)
            setActiveSuggestionIndex(0)
            setAutoCompleteValue(e.target.value, 0, filter)
        } else {
            setShowSuggestions(false)
            setAutoCompleteValue('')
        }
    }

    const onClickHandler = (e) => {
        setValue(e.target.innerText)
        setShowSuggestions(false)
        // Send the ref and give the code time to access
        // the value since it was just updated
        setTimeout(() => {
            onSubmit(autoCompleteRef)
            if (devSite) {
                return
            }
            setTimeout(() => {
                setValue('')
                setAutoCompleteValue('')
            }, 10)
        }, 10)
    }

    useEffect(() => {
        const handleOutsideCLick = (e) => {
            if (
                autoCompleteRef.current &&
                !autoCompleteRef.current.contains(e.target)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('click', handleOutsideCLick)
        return () => {
            document.removeEventListener('click', handleOutsideCLick)
        }
    }, [])

    const autoCompleteRef = useRef()

    return (
        <div className="auto-complete">
            <div style={{ position: 'relative' }}>
                {showSuggestions && (
                    <input
                        className="auto-complete-ghost"
                        type="text"
                        value={autoCompleteValue}
                        placeholder=""
                        disabled
                    />
                )}
                <input
                    style={{ position: 'relative', zIndex: 2 }}
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={autoCompleteRef}
                    onKeyDown={keyDownHandler}
                    placeholder={devSite ? "Enter name to edit" : "Enter your full name"}
                    required="required"
                    onClick={() => setShowSuggestions(value.trim().length > 0)}
                />
            </div>

            {showSuggestions && (
                <ul className="suggestions">
                    {suggestions.map((suggestion, index) => (
                        <li
                            className={
                                index === activeSuggestionIndex ? 'active' : ''
                            }
                            key={suggestion}
                            onClick={onClickHandler}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default AutoComplete

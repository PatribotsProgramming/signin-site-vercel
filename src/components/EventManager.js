import './EventManager.css'
import './ErrorList.css'
import { useEffect, useState } from 'react'
import { getData } from '../utils/firebaseConfig.js'

function EventManager(input, isStudent = true) {
    const [events, setEvents] = useState([])
    const [duration, setDuration] = useState('0:0:0')
    const [signedIn, setSignedIn] = useState(false)

    useEffect(() => {
        const data = getData()
        let name = input.name
        // Capitalize each beginning letter of the name
        name = name
            .split(' ')
            .map((word) => {
                return word.charAt(0).toUpperCase() + word.slice(1)
            })
            .join(' ')

        let [year, month, day] = input.date.split('-')

        // If anyone of them starts with 0, remove it
        if (day?.startsWith('0')) {
            day = day.slice(1)
        }
        if (month?.startsWith('0')) {
            month = month.slice(1)
        }

        data?.then((data) => {
            const eventData = isStudent ? data?.Students : data?.Parents
            const nameData = eventData?.[name]
            const yearData = nameData?.[year]
            const monthData = yearData?.[month]
            const dayData = monthData?.[day]
            // The data looks like this:
            // 0: { in: "8:00", out: "12:00" }
            // 1: { in: "13:00", out: "17:00" }
            // ...
            // duration: "8:0:0"
            // signedIn: false
            if (dayData === undefined) {
                setEvents([])
                setDuration('0:00')
                setSignedIn(false)
                return
            }

            const eventDataWithoutDurationAndSignedIn = Object.entries(dayData)
                .filter(([key]) => key !== 'duration' && key !== 'signedIn')
                .map(([_, value]) => {
                    const inTime = new Date(value.in).toLocaleTimeString(
                        'en-US',
                        {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                        }
                    )
                    const outTime = new Date(value.out).toLocaleTimeString(
                        'en-US',
                        {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                        }
                    )
                    return [
                        { state: 'In', time: inTime },
                        { state: 'Out', time: outTime },
                    ]
                })
                .flat()
            setEvents(eventDataWithoutDurationAndSignedIn)

            let hours = dayData?.duration.split(':')[0]
            let minutes = dayData?.duration.split(':')[1]
            // if mins is less than 10, add a 0 at end
            if (minutes.length === 1) {
                minutes += '0'
            }
            setDuration(hours + ':' + minutes)
            setSignedIn(dayData?.signedIn)
        })
    }, [input.name, input.date, isStudent])

    const keyDownHandler = (e) => {
        const value = e.target.value
        switch (e.key) {
            case 'Tab':
            case 'Enter':
                e.preventDefault()
                if (value === '') {
                    createErrorMessage(e);
                    return
                }
                const inputValue = value.trim()

                const parsedInput = parseInput(inputValue);
                if (!parsedInput) {
                    createErrorMessage(e);
                    return;
                }

                let currentHours = parseInt(duration.split(':')[0]);
                let currentMinutes = parseInt(duration.split(':')[1]);

                let hours = currentHours + parsedInput.inputHours;
                let minutes = currentMinutes + parsedInput.inputMinutes;

                const adjustedTime = adjustTime(hours, minutes);
                hours = adjustedTime.hours;
                minutes = adjustedTime.minutes;

                if (isNaN(hours) || isNaN(minutes)) {
                    createErrorMessage(e);
                    return;
                }
                setDuration(hours + ':' + minutes)
                input.onSubmit(hours, minutes)

                e.target.value = ''
                break;
            case 'Escape':
                // in case the above case was just triggered,
                // wait a bit before clearing the value
                // so that it can be sent to onSubmit
                e.target.value = ''
                e.preventDefault()
                break
            default:
        }
    }

    const createErrorMessage = (e) => {
        e.target.value = ''

        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'Invalid input!';
        errorMessage.className = 'error-message';

        // Position it above the input element
        errorMessage.style.left = `${e.target.offsetLeft + e.target.offsetWidth / 2 - 73}px`;
        errorMessage.style.top = `${-e.target.offsetTop - 7.5}px`;

        // Insert it into the DOM
        e.target.parentNode.insertBefore(errorMessage, e.target);

        // Remove it after 2 seconds
        setTimeout(() => {
            errorMessage.parentNode.removeChild(errorMessage);
        }, 2000);
    }

    const parseInput = (inputValue) => {
        let inputHours, inputMinutes;

        // Check if input is in "hours:minutes" format
        if (inputValue.includes(':')) {
            [inputHours, inputMinutes] = inputValue.split(':').map(Number);
        } else if (!isNaN(inputValue)) {
            // If not, assume it's a decimal number representing hours
            inputHours = Math.floor(inputValue);
            inputMinutes = Math.round((inputValue - inputHours) * 60);
        } else {
            // If input is neither a decimal number nor in "hours:minutes" format, exit
            return null;
        }

        return { inputHours, inputMinutes };
    }

    const adjustTime = (hours, minutes) => {
        // Adjust hours and minutes if minutes are over 60
        if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
        }

        // clamp hours from 0-12
        // if hours is less than 0, set hours and minutes to zero
        if (hours < 0) {
            hours = 0
            minutes = 0
        }
        hours = Math.min(12, Math.max(0, hours))

        // if mins is less than 10, add a 0 at end
        if (minutes < 10) {
            minutes = `0${minutes}`
        }

        return { hours, minutes };
    }

    const eventInputs = (
        <div className="pair">
            <input
                type="text"
                value={
                    signedIn ? 'Currently Signed In' : 'Currently Signed Out'
                }
                disabled
            />
            <input type="text" value={'Daily Hours: ' + duration} disabled />
            <input
                type="text"
                style={{ textAlign: 'center', width: '100%' }}
                placeholder="Add or Remove Hours..."
                onKeyDown={keyDownHandler}
            />
        </div>
    )

    return (
        <div className="body">
            {events.length === 0 ? (
                input.name === '' ? (
                    <h4 className="no-events">Please enter a name</h4>
                ) : input.date === '' ? (
                    <h4 className="no-events">Please enter a date</h4>
                ) : (
                    <div>
                        {eventInputs}
                        <h4 className="no-events">No events on record</h4>
                    </div>
                )
            ) : (
                <div className="event-manager">
                    {eventInputs}
                    <h1
                        style={{
                            paddingTop: '5%',
                            color: 'lightgray',
                            textAlign: 'center',
                            paddingBottom: '0.5em',
                        }}
                    >
                        Events:{' '}
                    </h1>
                    <hr className="solid" />
                    <div
                        className="events"
                        style={{
                            maxHeight: 'calc(85vh - 19em)',
                            overflow: 'auto',
                        }}
                    >
                        {events &&
                            events.map(
                                (event, index) =>
                                    event && (
                                        <div className="event" key={index}>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div
                                                    className="mb-3"
                                                    style={{
                                                        placeItems: 'flex-end',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '25%',
                                                            }}
                                                        >
                                                            <input
                                                                style={{
                                                                    verticalAlign:
                                                                        'middle',
                                                                    width: '100%',
                                                                }}
                                                                type="text"
                                                                value={
                                                                    event.state
                                                                }
                                                                disabled
                                                            />
                                                        </div>
                                                        <div
                                                            style={{
                                                                width: '75%',
                                                            }}
                                                        >
                                                            <input
                                                                defaultValue={
                                                                    event.time
                                                                }
                                                                type="time"
                                                                readOnly
                                                                style={{
                                                                    width: '100%',
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                            )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default EventManager

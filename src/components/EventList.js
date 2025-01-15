import './EventList.css'
import { AppContext } from '../App.js'
import { useContext, useEffect, useState } from 'react'
import { getData } from '../utils/firebaseConfig.js'

const EventList = ({date, user, forceUpdate}) => {
    const [events, setEvents] = useState([])
    const [duration, setDuration] = useState('0:0:0')
    const [studentList, parentList] = useContext(AppContext)

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
    }

    useEffect(() => {
        const data = getData()
        let name = user
        // Capitalize each beginning letter of the name
        name = toTitleCase(name)
        
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        
        data?.then((data) => {
            const isStudent = studentList.includes(name);
            const eventData = isStudent ? data?.Students : data?.Parents
            const nameData = eventData?.[name]
            const yearData = nameData?.[year]
            const monthData = yearData?.[month]
            const dayData = monthData?.[day]
            console.log(dayData);
            // The data looks like this:
            // 0: { in: "8:00", out: "12:00" }
            // 1: { in: "13:00", out: "17:00" }
            // ...
            // duration: "8:0:0"
            // signedIn: false
            if (dayData === undefined) {
                setEvents([])
                setDuration('0:00')
                return
            }

            const eventDataWithoutDurationAndSignedIn = Object.entries(dayData)
                .filter(([key]) => key !== 'duration' && key !== 'signedIn')
                .map(([_, value]) => {
                    const formatTime = (time) => new Date(time).toLocaleTimeString(
                        'en-US',
                        {
                            hour12: true,
                            hour: '2-digit',
                            minute: '2-digit',
                        }
                    )
                    const inTime = formatTime(value.in)
                    const outTime = formatTime(value.out)
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
            minutes = minutes.toString().padStart(2, '0');
            setDuration(hours + ':' + minutes)
        })
    }, [user, date, forceUpdate])

    return (
        <div className='event-list'>
            <h3>Events</h3>
            <ul className='event-list-container'>
                {events && events.map((event, index) => (
                    <p className={`event ${event.state.toLowerCase()}`} key={index}>
                        {event.state} - {event.time}
                    </p>
                ))}
            </ul>
            <div className='total'>
                <h5>Daily Duration: </h5>
                <h5 className='duration'>{duration} </h5>
                <h5>hrs</h5>
            </div>
        </div>
    )

}

export default EventList
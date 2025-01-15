import './EventList.css'
import { useEffect, useState } from 'react'
import { getData } from '../utils/firebaseConfig.js'

const EventList = ({date, user, isStudent = true}) => {
    const [events, setEvents] = useState([])
    const [duration, setDuration] = useState('0:0:0')

    useEffect(() => {
        const data = getData()
        let name = user
        // Capitalize each beginning letter of the name
        name = name
            .split(' ')
            .map((word) => {
                return word.charAt(0).toUpperCase() + word.slice(1)
            })
            .join(' ')

        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        console.log(year, month, day);
        
        data?.then((data) => {
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
        })
    }, [user, date, isStudent])

    return (
        <div className='event-list'>
            <h3>Events</h3>
            <ul>
                {events && events.map((event, index) => (
                    <li key={index}>
                        {event.state} - {event.time}
                    </li>
                ))}
            </ul>
            <h3>Total Duration</h3>
            <p>{duration} hours</p>
        </div>
    )

}

export default EventList
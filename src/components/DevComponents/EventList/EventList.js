import './EventList.css'
import { AppContext } from '../../../App.js'
import { useContext, useEffect, useState } from 'react'
import { getData } from '../../../utils/firebaseConfig.js'

const EventList = ({ date, user, forceUpdate, sendEvents }) => {
    const [todaysEvents, setTodaysEvents] = useState([]);
    const [weekEvents, setWeekEvents] = useState([]);

    const [duration, setDuration] = useState('0:0:0');
    const [studentList, parentList] = useContext(AppContext);

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
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let weekStart = new Date(date);
        weekStart.setDate(day - date.getDay());

        data?.then((data) => {
            const isStudent = studentList.includes(name);
            const eventData = isStudent ? data?.Students : data?.Parents
            const nameData = eventData?.[name]
            const yearData = nameData?.[year]

            const weekEventsTemp = [];
            let todaysEventsTemp = [];
            let todaysDuration = '0:00';

            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(weekStart);
                currentDate.setDate(weekStart.getDate() + i);
                const currentDay = currentDate.getDate();
                const currentMonth = currentDate.getMonth() + 1;

                const monthData = yearData?.[currentMonth];
                const dayData = monthData?.[currentDay];

                if (dayData === undefined) continue;

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
                    .flat();

                const formattedDuration = dayData?.duration.split(':').slice(0, 2).map((unit, index) => index === 1 ? unit.padStart(2, '0') : unit).join(':');
                if (currentDay === day && currentMonth === month) {
                    todaysEventsTemp = eventDataWithoutDurationAndSignedIn;
                    todaysDuration = formattedDuration;
                }

                weekEventsTemp.push({
                    date: currentDate,
                    events: eventDataWithoutDurationAndSignedIn,
                    duration: formattedDuration,
                });
            }

            setTodaysEvents(todaysEventsTemp);
            setDuration(todaysDuration);
            setWeekEvents(weekEventsTemp);
        })
    }, [user, date, forceUpdate])

    useEffect(() => {
        sendEvents(weekEvents)
    }, [weekEvents, sendEvents])

    return (
        <div className='event-list'>
            <h3>Events</h3>
            <ul className='event-list-container'>
                {todaysEvents && todaysEvents.map((event, index) => (
                    <p className={`event ${event.state.toLowerCase()}`} key={index}>
                        {event.state} - {event.time}
                    </p>
                ))}
            </ul>
            <div className='total'>
                <h5>Daily Hours: </h5>
                <h5 className='duration'>{duration} </h5>
            </div>
        </div>
    )
}

export default EventList
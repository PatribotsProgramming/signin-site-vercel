import { useState, useContext } from 'react'
import { AppContext } from '../App.js'
import AutoComplete from '../components/AutoComplete.js'
import EventManager from '../components/EventManager.js'
import ErrorList from '../components/ErrorList.js'
import EventList from '../components/EventList.js'
import './Dev.css'
import './Dev2.css'
import { getData, setData } from '../utils/firebaseConfig.js'
import DateSelector from '../components/DateSelector.js'
import DurationChanger from '../components/DurationChanger.js'

function Dev() {
    const [studentWhitelist, parentWhitelist] = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState(new Date(Date.now()))

    let inputName = ''
    let inputDate = new Date().toISOString().split('T')[0]
    const [selectedName, setSelectedName] = useState(inputName)
    const [updateEventList, setUpdateEventList] = useState(false)

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        })
    }

    const handleDurationChange = (addedHours, addedMinutes, isNegative) => {
        // Get the current duration of the current day
        // += the added duration
        // Set the new duration
        const data = getData()

        data.then((data) => {
            let titleCaseName = toTitleCase(selectedName)
            const isStudent = studentWhitelist.includes(titleCaseName)
            let category = isStudent ? data.Students : data.Parents
            try {
                let year = selectedDate.getFullYear();
                let month = selectedDate.getMonth() + 1;
                let day = selectedDate.getDate();

                let duration = '0:00:0'
                const dayData = category?.[titleCaseName]?.[year]?.[month]?.[day];
                if (dayData) {
                    duration = dayData.duration || '0:0:0';
                }
                let [hours, minutes, seconds] = duration.split(':')

                hours = Math.min(12, Math.max(-1, parseInt(hours) + parseInt(addedHours)));
                if (isNegative) {
                    if (parseInt(minutes) < parseInt(addedMinutes)) {
                        hours = Math.max(-1, hours - 1);
                        minutes = 60 + parseInt(minutes) - parseInt(addedMinutes);
                    } else {
                        minutes = parseInt(minutes) - parseInt(addedMinutes);
                    }
                } else {
                    minutes = parseInt(minutes) + parseInt(addedMinutes)
                }
                minutes = Math.min(59, Math.max(0, minutes))

                if (hours < 0) {
                    hours = 0;
                    minutes = 0;
                    seconds = 0;
                } else if (hours > 11) {
                    hours = 12;
                    minutes = 0;
                    seconds = 0;
                }
                minutes = minutes.toString().padStart(2, '0');

                duration = `${hours}:${minutes}:${seconds}`
                // one last check to make sure no NaNs are being sent
                if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
                    console.error('NaNs are being sent to the database')
                    return
                }

                setData(
                    isStudent,
                    toTitleCase(selectedName),
                    year,
                    month,
                    day,
                    null,
                    'duration',
                    duration
                )
                setUpdateEventList(!updateEventList)
            } catch (e) {
                console.error(e)
            }
        })
    }

    const handleNameChange = (e) => {
        const value = e.current.value || selectedName
        const input = value
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9 ]/g, '')
        setSelectedName(input)
    }

    return (
        <div className="calendar-container">
            <aside className="sidebar">
                <AutoComplete className="auto-complete"
                    onSubmit={handleNameChange}
                    whitelist={[...studentWhitelist, ...parentWhitelist]}
                    devSite={true}
                />
                <DateSelector onSubmit={setSelectedDate} />
                <EventList 
                    date={selectedDate} 
                    user={selectedName}
                    forceUpdate={updateEventList}
                />
                {selectedName && (<DurationChanger onSubmit={handleDurationChange} />)}
            </aside>
            <main className="main-content">
                {/* <Header date={selectedDate} /> */}
                {/* <WeekView date={selectedDate} user={selectedUser} /> */}
            </main>
        </div>
    )
}

export default Dev

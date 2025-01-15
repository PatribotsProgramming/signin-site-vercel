import { useState, useEffect } from 'react'
import AutoComplete from '../components/AutoComplete.js'
import EventManager from '../components/EventManager.js'
import ErrorList from '../components/ErrorList.js'
import EventList from '../components/EventList.js'
import './Dev.css'
import './Dev2.css'
import { getData, setData } from '../utils/firebaseConfig.js'
import { min } from 'lodash'
import DateSelector from '../components/DateSelector.js'

function Dev() {
    const [studentWhitelist, setStudentWhitelist] = useState([])
    const [parentWhitelist, setParentWhitelist] = useState([])
    const [combinedWhitelist, setCombinedWhitelist] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date(Date.now()))

    let inputName = ''
    let inputDate = new Date().toISOString().split('T')[0]
    const [selectedName, setSelectedName] = useState(inputName)

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
            let studentData = isStudent ? data.Students : data.Parents
            try {
                let duration = '0:0:0'
                let [currentYear, currentMonth, currentDay] =
                    selectedDate.split('-')
                if (currentDay.startsWith('0')) {
                    currentDay = currentDay.slice(1)
                }
                if (currentMonth.startsWith('0')) {
                    currentMonth = currentMonth.slice(1)
                }
                if (
                    studentData[titleCaseName] &&
                    studentData[titleCaseName][currentYear] &&
                    studentData[titleCaseName][currentYear][currentMonth] &&
                    studentData[titleCaseName][currentYear][currentMonth][
                        currentDay
                    ]
                ) {
                    duration =
                        studentData[titleCaseName][currentYear][currentMonth][
                            currentDay
                        ].duration || '0:0:0'
                    console.log(duration)
                }
                console.log(addedHours, addedMinutes)
                let [hours, minutes, seconds] = duration.split(':')
                // the addedDuration is in hours
                hours = parseInt(hours) + parseInt(addedHours)
                if (isNegative) {
                    minutes = parseInt(minutes) - parseInt(addedMinutes)
                } else {
                    minutes = parseInt(minutes) + parseInt(addedMinutes)
                }

                if (hours < 0) {
                    hours = 0;
                    minutes = 0;
                    seconds = 0;
                } else {
                    // clamp hours from 0-12
                    hours = Math.min(12, Math.max(0, hours))
                    // clamp minutes from 0-59
                    minutes = Math.min(59, Math.max(0, minutes))
                    if (minutes < 10) {
                        minutes = `0${minutes}`
                    }
                }

                duration = `${hours}:${minutes}:${seconds}`

                let [year, month, day] = selectedDate.split('-')

                // if the day starts with 0, remove it
                if (day.startsWith('0')) {
                    day = day.slice(1)
                }
                if (month.startsWith('0')) {
                    month = month.slice(1)
                }

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

    const getEventData = async (inputName, inputDate) => {
        if (!inputName) return []
        const response = await fetch(process.env.REACT_APP_GET_SHEET_DATA, {
            method: 'GET',
        })

        const json = await response.json()

        let arrayIndex = studentWhitelist
            .map((name) => name.toLowerCase())
            .includes(inputName.toLowerCase())
            ? 3
            : 5

        if (
            !(
                json.valueRanges &&
                json.valueRanges[arrayIndex] &&
                json.valueRanges[arrayIndex].values
            )
        ) {
            console.log('no data!')
            return []
        }
        const data = json.valueRanges[arrayIndex].values

        function areSameDay(date1, date2) {
            const newDate1 = new Date(date1)
            const newDate2 = new Date(date2)

            return (
                newDate1.getFullYear() === newDate2.getFullYear() &&
                newDate1.getMonth() === newDate2.getMonth() &&
                newDate1.getDate() === newDate2.getDate()
            )
        }

        return data
            .map((row) => {
                const name = row[0]
                const state = row[1]
                const date = row[2].split(' ')[0]
                const time = row[2].split(' ')[1]

                let event = {
                    name: name,
                    state: state,
                    time: time,
                    date: date,
                }

                if (
                    event.name.toLowerCase() === inputName &&
                    areSameDay(event.date, inputDate)
                ) {
                    return event
                } else {
                    return null
                }
            })
            .filter((event) => event !== null)
    }

    useEffect(() => {
        fetch(process.env.REACT_APP_GET_SHEET_DATA, { method: 'GET' })
            .then((response) => response.json())
            .then((json) => {
                if (
                    json.valueRanges &&
                    json.valueRanges[4] &&
                    json.valueRanges[4].values
                ) {
                    setErrors(json.valueRanges[4].values.map((row) => row[0]))
                }

                if (
                    json.valueRanges &&
                    json.valueRanges[2] &&
                    json.valueRanges[2].values
                ) {
                    const studentNames = json.valueRanges[2].values
                        .map((name) => name[0])
                        .filter(
                            (name, index, self) =>
                                name !== undefined &&
                                name.replace(/[^a-zA-Z0-9 ]/g, '').trim() !==
                                    '' &&
                                self.indexOf(name) === index // Check if the current index is the first occurrence of the name
                        )
                    setStudentWhitelist(studentNames)

                    const parentNames = json.valueRanges[2].values
                        .map((row) => {
                            // Extract parent names from columns 3-8
                            let parentNames = row
                                .slice(2, 8)
                                .filter((name) => name !== undefined)
                            return parentNames
                        })
                        .flat() // Flatten the array
                        .filter(
                            (name, index, self) =>
                                name.replace(/[^a-zA-Z0-9 ]/g, '').trim() !==
                                    '' && self.indexOf(name) === index // Check if the current index is the first occurrence of the name
                        )
                    setParentWhitelist(parentNames)
                    setCombinedWhitelist([...studentNames, ...parentNames])
                }
            })
    }, [])

    return (
        <div className="calendar-container">
            <aside className="sidebar">
                <AutoComplete className="auto-complete"
                    onSubmit={handleNameChange}
                    whitelist={combinedWhitelist}
                    devSite={true}
                />
                <DateSelector onSubmit={setSelectedDate} />
                <EventList date={selectedDate} user={selectedName} />
            </aside>
            <main className="main-content">
                {/* <Header date={selectedDate} /> */}
                {/* <WeekView date={selectedDate} user={selectedUser} /> */}
            </main>
        </div>
    )
}

export default Dev

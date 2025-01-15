import { useState, useContext} from 'react'
import { AppContext } from '../App.js'
import AutoComplete from '../components/AutoComplete.js'
import EventManager from '../components/EventManager.js'
import ErrorList from '../components/ErrorList.js'
import './Dev.css'
import { getData, setData } from '../utils/firebaseConfig.js'

function Dev() {
    const [studentWhitelist, parentWhitelist] = useContext(AppContext);

    let inputName = ''
    let inputDate = new Date().toISOString().split('T')[0]
    const [searchDate, setSearchDate] = useState(inputDate)
    const [searchName, setSearchName] = useState(inputName)
    const [errors, setErrors] = useState([])

    const handleDateChange = (e) => {
        e.preventDefault()
        setSearchDate(e.target.value)
    }

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
            let titleCaseName = toTitleCase(searchName)
            const isStudent = studentWhitelist.includes(titleCaseName)
            let studentData = isStudent ? data.Students : data.Parents
            try {
                let duration = '0:0:0'
                let [currentYear, currentMonth, currentDay] =
                    searchDate.split('-')
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

                let [year, month, day] = searchDate.split('-')

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
                    toTitleCase(searchName),
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
        const value = e.current.value || searchName
        const input = value
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9 ]/g, '')
        setSearchName(input)
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

    return (
        <div>
            <span className="grid-container">
                <div className="left-col">
                    <div className="student-date">
                        <span style={{ width: '30%' }}>
                            <h1
                                style={{
                                    color: 'lightgray',
                                    textAlign: 'center',
                                }}
                            >
                                Name
                            </h1>
                            <AutoComplete
                                onSubmit={handleNameChange}
                                whitelist={[...studentWhitelist, ...parentWhitelist]}
                                devSite={true}
                            />
                        </span>

                        <span style={{ width: '30%' }}>
                            <h1
                                style={{
                                    color: 'lightgray',
                                    textAlign: 'center',
                                }}
                            >
                                Date
                            </h1>
                            <input
                                className="form-control"
                                value={searchDate}
                                type="date"
                                onChange={handleDateChange}
                            />
                        </span>
                    </div>

                    <EventManager
                        name={searchName}
                        date={searchDate.toString()}
                        getEventData={getEventData}
                        onSubmit={handleDurationChange}
                    />
                </div>

                <div className="errors">
                    <ErrorList errors={errors} />
                </div>
            </span>
        </div>
    )
}

export default Dev

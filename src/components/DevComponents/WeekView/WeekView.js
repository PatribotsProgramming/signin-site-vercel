import './WeekView.css';

const generateTimeSlots = () => {
    const times = [];
    for (let hour = 9; hour <= 21; hour++) {
        const period = hour < 12 ? 'AM' : 'PM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        times.push(`${displayHour} ${period}`);
    }
    return times;
};

const generateGridItems = () => {
    const items = [];
    const totalRows = 23 - 9;
    const totalItems = totalRows * 7; // (hours * days)

    for (let i = 0; i < totalItems; i++) {
        const isBottomRow = i >= totalItems - 7; // Check if the item is in the bottom row
        const isRightColumn = (i + 1) % 7 === 0; // Check if the item is in the rightmost column
        let className = 'week-view-grid-item';

        if (isBottomRow) {
            className += ' no-bottom-border';
        }
        if (isRightColumn) {
            className += ' no-right-border';
        }

        items.push(<div className={className} key={i}></div>);
    }
    return items;
};

const getWeekDates = (currentDate) => {
    const weekDates = [];
    const firstDayOfWeek = currentDate.getDate() - currentDate.getDay(); // Get the first day of the current week (Sunday)

    for (let i = 0; i < 7; i++) {
        const dateCopy = new Date(currentDate);
        dateCopy.setDate(firstDayOfWeek + i);
        weekDates.push(dateCopy.getDate());
    }

    return weekDates;
};

const calculateEventPosition = (startTime, endTime) => {
    let [startHour, startMinute, startAMPM] = startTime.split(/[: ]/);
    let [endHour, endMinute, endAMPM] = endTime.split(/[: ]/);

    startHour = parseInt(startHour); 
    startMinute = parseInt(startMinute);
    endHour = parseInt(endHour);
    endMinute = parseInt(endMinute);
    const startHour24 = startAMPM === 'PM' && startHour !== 12 ? startHour + 12 : startHour;
    const endHour24 = endAMPM === 'PM' && endHour !== 12 ? endHour + 12 : endHour;

    // The hour represents the row. The minute represents the position%/60 within the row.
    // Height should be converted from the duration (as a decimal) to row height
    // Position should be absolute, with a parent div that is relative
    
    const durationDecimal = (endHour24 + endMinute / 60) - (startHour24 + startMinute / 60); 
    const top = (startHour24 - 9) * 88*850.0/1550.0 + 88*850.0/1550.0*startMinute/60 + 251.0*850.0/1550.0; // 60px per hour
    const height = durationDecimal * 88*850.0/1550.0;
    return { top, height, duration: `${endHour24 - startHour24}:${endMinute}` };
};

const DraggableEvent = ({ event }) => {
    const { top, height, duration } = calculateEventPosition(event.in, event.out);
    
    return (
        <div
            className="event"
            style={{
                position: 'absolute',
                top: `${top}px`,
                height: `${height}px`,
                backgroundColor: '#a29bfe',
                width: '10%',
                left: '33.5%',
                borderRadius: '5px',
                padding: '5px',
                cursor: 'pointer',
            }}
        >
            <strong>{event.title}</strong>
            <div>{duration}</div>
        </div>
    );
};

const WeekView = ({ date, user, events }) => {
    const timeSlots = generateTimeSlots();
    const weekDates = getWeekDates(date);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const gridItems = generateGridItems();
    
    const inEvents = [];
    const outEvents = [];

    events.forEach(event => {
        if (event.state === 'In') {
            inEvents.push(event);
        } else if (event.state === 'Out') {
            outEvents.push(event);
        }
    });

    const zippedEvents = inEvents.map((inEvent, index) => ({
        in: inEvent.time,
        out: outEvents[index].time
    }));

    return (
        <div className="week-view">
            <div className="week-view-grid-container">
                <div className='times-header'>
                    {timeSlots.map((time, index) => (
                        <div className='time' key={index}>{time}</div>
                    ))}
                </div>
                <div>
                    <div className="week-view-grid-header">
                        {weekDays.map((day, index) => (
                            <div key={index}>{day}<br />{weekDates[index]}</div>
                        ))}
                    </div>
                    <div className="week-view-grid">
                        {gridItems}
                        {zippedEvents.map((event) => (
                            <DraggableEvent key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeekView;
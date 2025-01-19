import './WeekView.css';
import DraggableEvent from './DraggableEvent';

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

const WeekView = ({ date, user, weekEvents }) => {
    const timeSlots = generateTimeSlots();
    const weekDates = getWeekDates(date);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const gridItems = generateGridItems();
    
    const inEvents = [];
    const outEvents = [];

    weekEvents.forEach(day => {
        day.events.forEach(event => {
            if (event.state === 'In') {
                inEvents.push({ ...event, date: day.date });
            } else if (event.state === 'Out') {
                outEvents.push({ ...event, date: day.date });
            }
        });
    });

    const zippedEvents = inEvents.map((inEvent, index) => ({
        in: inEvent.time,
        out: outEvents[index].time,
        date: inEvent.date,
    }));

    return (
        <div className="week-view">
            <div className="week-view-grid-container">
                <div>
                    <div className='times-spacer' />
                    <div className='times-header'>
                        {timeSlots.map((time, index) => (
                            <div className='time' key={index}>{time}</div>
                        ))}
                    </div>
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
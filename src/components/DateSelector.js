import './DateSelector.css';
import React, { useState } from 'react';

const DateSelector = ({onSubmit}) => {
    const [currentDate, setCurrentDate] = useState(new Date(Date.now()));
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const onClick = (day) => {
        const newDate = new Date(year, month, day);
        setCurrentDate(newDate);
        onSubmit(newDate);
    }

    const pushDay = (days, day) => {
        days.push(
            <td key={day}>
                <button
                    className={`day-button ${day === currentDate.getDate() ? 'selected' : ''}`}
                    onClick={() => onClick(day)}
                >
                    {day}
                </button>
            </td>
        );
        return days;
    }

    const generateCalendar = () => {
        const daysInMonth = getDaysInMonth(month, year);
        const firstDay = new Date(year, month, 1).getDay();
        const weeks = [];
        let days = [];

        // Fill the first row with empty cells until the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<td key={`empty-${i}`}></td>);
        }

        // Fill the calendar with days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            pushDay(days, day);

            // If the week is complete, push it to weeks array and reset days array
            if (days.length === 7) {
                weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
                days = [];
            }
        }

        // Fill the last row with empty cells if necessary
        if (days.length > 0) {
            while (days.length < 7) {
                days.push(<td key={`empty-${days.length}`}></td>);
            }
            weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
        }

        return weeks;
    };

    const leftArrow = (
        <svg width="18" height="18" viewBox="0 0 24 24" focusable="false" className="arrow-svg">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"></path>
        </svg>
    );
    const rightArrow = (
        <svg width="18" height="18" viewBox="0 0 24 24" focusable="false" className="arrow-svg">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"></path>
        </svg>
    );

    return (
        <div className="date-selector">
            <div className="month-selector">
                <span>{currentDate.toLocaleString('default', { month: 'long' })} {year}</span>
                <button className='arrow' onClick={() => setCurrentDate(new Date(year, month + 1, day))}>{rightArrow}</button>
                <button className='arrow' onClick={() => setCurrentDate(new Date(year, month - 1, day))}>{leftArrow}</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <td className='hoverable' data-day='Sunday'>S</td>
                        <td className='hoverable' data-day='Monday'>M</td>
                        <td className='hoverable' data-day='Tuesday'>T</td>
                        <td className='hoverable' data-day='Wednesday'>W</td>
                        <td className='hoverable' data-day='Thursday'>T</td>
                        <td className='hoverable' data-day='Friday'>F</td>
                        <td className='hoverable' data-day='Saturday'>S</td>
                    </tr>
                </thead>
                <tbody>
                    {generateCalendar()}
                </tbody>
            </table>
        </div>
    );
};

export default DateSelector;
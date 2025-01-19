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

    const onClick = (day, monthOffset = 0) => {
        const newDate = new Date(year, month + monthOffset, day);
        setCurrentDate(newDate);
        onSubmit(newDate);
    }

    const onMonthChange = (month) => {
        const newDate = new Date(year, month, day);
        setCurrentDate(newDate);
        onSubmit(newDate);
    }

    const pushDay = (days, day, monthOffset = 0, className = '') => {
        const today = new Date(Date.now()).getDate();
        const isToday = day === today && monthOffset === 0;
        days.push(
            <td key={`${monthOffset}-${day}`}>
                <button
                    className={`day-button ${className} ${day === currentDate.getDate() && monthOffset === 0 ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => onClick(day, monthOffset)}
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

        // Fill the first row with days from the previous month
        const prevMonthDays = getDaysInMonth(month - 1, year);
        for (let i = firstDay - 1; i >= 0; i--) {
            pushDay(days, prevMonthDays - i, -1, 'other-month');
        }

        // Fill the calendar with days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            pushDay(days, day);

            // If the week is complete, push it to weeks array and reset days array
            if (days.length === 7) {
                weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);
                days = [];
            }
        }

        // Fill the last row with days from the next month
        let nextMonthDay = 1;
        while (days.length < 7) {
            pushDay(days, nextMonthDay++, 1, 'other-month');
        }
        weeks.push(<tr key={`week-${weeks.length}`}>{days}</tr>);

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
                <button className='arrow' onClick={() => onMonthChange(month + 1)}>{rightArrow}</button>
                <button className='arrow' onClick={() => onMonthChange(month - 1)}>{leftArrow}</button>
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
import './WeekView.css';

const interpolateGradient = (gradient, value) => {
    value = Math.max(0, Math.min(100, value));

    const stepSize = 100 / (gradient.length - 1);
    const index = Math.floor(value / stepSize);

    if (index === gradient.length - 1) {
        return gradient[index];
    }

    const lowerColor = gradient[index];
    const upperColor = gradient[index + 1];
    const ratio = (value - index * stepSize) / stepSize;
    return interpolateColors(lowerColor, upperColor, ratio);

    function interpolateColors(color1, color2, ratio) {
        const [r1, g1, b1] = hexToRgb(color1);
        const [r2, g2, b2] = hexToRgb(color2);

        const r = Math.round(r1 + ratio * (r2 - r1));
        const g = Math.round(g1 + ratio * (g2 - g1));
        const b = Math.round(b1 + ratio * (b2 - b1));
        return rgbToHex(r, g, b);
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? [
                  parseInt(result[1], 16),
                  parseInt(result[2], 16),
                  parseInt(result[3], 16),
              ]
            : [0,0,0];
    }

    function rgbToHex(r, g, b) {
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
};


const calculateEventPosition = (startTime, endTime, date) => {
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
    
    const durationDecimal = (endHour24 - startHour24) + ((endMinute - startMinute) / 60);
    const rowHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--row-height'));
    const height = durationDecimal * rowHeight;
    const top = (startHour24 - 8 + (startMinute / 60)) * rowHeight;
    const rowWidth = 100 / 7;
    const left = rowWidth * parseInt(date.getDay());
    return { top, height, left, duration: `${endHour24 - startHour24}:${endMinute}` };
};

const DraggableEvent = ({ event }) => {
    let currentlySignedIn = false;

    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
    });
    if (event.out === "Currently Signed In") {
        currentlySignedIn = true;
    }

    const { top, height, left, duration } = calculateEventPosition(event.in, currentlySignedIn ? currentTime : event.out, event.date);
    const colors = ['#833ab4', '#74b9ff', '#01daba'];
    const lowerColor = interpolateGradient(colors, top / 2.1);
    const upperColor = currentlySignedIn ? "#00c36e" : interpolateGradient(colors, (top + height) / 2.1);
    const color = `linear-gradient(${lowerColor}, ${upperColor})`;

    const fontSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('font-size'));
    const heightPx = (height / 100) * window.innerHeight;
    
    return (
        <div
            className="event draggable"
            style={{
                top: `${top}vh`,
                height: `${height}vh`,
                background: color,
                left: `calc(${left}% + (var(--row-width) * 0.05))`,
                '--random-delay': Math.random() * 4,
            }}
        >
            {heightPx > 2.75 * fontSize && (
                <>
                    <div className="event-time-top">{event.in}</div>
                    <div className="event-time-bottom">{currentlySignedIn ? "Now" : event.out}</div>
                </>
            )}
        </div>
    );
};

export default DraggableEvent;
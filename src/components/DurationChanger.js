function DurationChanger({onSubmit}) {

    const keyDownHandler = (e) => {
        const value = e.target.value
        switch (e.key) {
            case 'Tab':
            case 'Enter':
                e.preventDefault()
                if (value === '') {
                    createErrorMessage(e);
                    return
                }
                const inputValue = value.trim()

                const parsedInput = parseInput(inputValue);
                
                if (!parsedInput) {
                    createErrorMessage(e);
                    return;
                }
                
                let hours = parsedInput.inputHours;
                const isNegative = inputValue.startsWith('-');
                let minutes = parsedInput.inputMinutes;

                const adjustedTime = adjustTime(hours, minutes);
                hours = adjustedTime.hours;
                minutes = adjustedTime.minutes;

                if (isNaN(hours) || isNaN(minutes)) {
                    createErrorMessage(e);
                    return;
                }
                onSubmit(parsedInput.inputHours, parsedInput.inputMinutes, isNegative)

                e.target.value = ''
                break;
            case 'Escape':
                e.target.value = ''
                e.preventDefault()
                break
            default:
        }
    }

    const createErrorMessage = (e) => {
        e.target.value = ''

        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.textContent = 'Invalid input!';
        errorMessage.className = 'error-message';

        // Position it above the input element
        errorMessage.style.left = `${e.target.offsetLeft + e.target.offsetWidth * 1.1}px`;
        errorMessage.style.top = `${e.target.offsetTop + 4}px`;

        // Insert it into the DOM
        e.target.parentNode.insertBefore(errorMessage, e.target);

        // Remove it after 2 seconds
        setTimeout(() => {
            errorMessage.parentNode.removeChild(errorMessage);
        }, 2000);
    }

    const parseInput = (inputValue) => {
        let inputHours, inputMinutes;

        // Check if input is in "hours:minutes" format
        if (inputValue.includes(':')) {
            [inputHours, inputMinutes] = inputValue.split(':').map(Number);
        } else if (!isNaN(inputValue)) {
            // If not, assume it's a decimal number representing hours
            inputHours = Math.floor(inputValue);
            inputMinutes = Math.round((inputValue - inputHours) * 60);
        } else {
            // If input is neither a decimal number nor in "hours:minutes" format, exit
            return null;
        }

        return { inputHours, inputMinutes };
    }

    const adjustTime = (hours, minutes) => {
        // Adjust hours and minutes if minutes are over 60
        if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
        }

        // clamp hours from 0-12
        // if hours is less than 0, set hours and minutes to zero
        if (hours < 0) {
            hours = 0
            minutes = 0
        }
        hours = Math.min(12, Math.max(0, hours))

        // if mins is less than 10, add a 0 at end
        if (minutes < 10) {
            minutes = `0${minutes}`
        }

        return { hours, minutes };
    }

    return (
        <input
            type="text"
            style={{ textAlign: 'center', width: '100%' }}
            placeholder="Add or Remove Hours..."
            onKeyDown={keyDownHandler}
        />
    );
}

export default DurationChanger;
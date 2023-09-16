let minute = document.getElementById('minute');
let second = document.getElementById('second');

const createdAt = Date.now();
const expriesAt =  Date.now() + (60000 * 2);

function updateCountdown() {
    
    const distance = expriesAt - Date.now();
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (distance <= 0) {
        clearInterval(countdownInterval);
        minute.textContent = '00';
        second.textContent = '00';
    } else {
        minute.textContent = minutes.toString().padStart(2, '0');
        second.textContent = seconds.toString().padStart(2, '0');
    }
}

updateCountdown();

const countdownInterval = setInterval(updateCountdown, 1000);
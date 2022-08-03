const TIMER = document.getElementById('timer');

const TIME_LIMIT = 60;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

function onTimesUp() {
    clearInterval(timerInterval);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        TIMER.setAttribute('data-before', TIME_LIMIT - timePassed);

        if (timeLeft === 0) {
            onTimesUp();
        }
    }, 1000);
}
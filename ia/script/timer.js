const TIMER = document.getElementById('timer');

const TIME_LIMIT = 10;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

const SECOND_IN_MS = 1000;
const UPDATE_INTERVAL = SECOND_IN_MS / 60;

window.onload = () => TIMER.setAttribute('data-before', TIME_LIMIT - timePassed);

function onTimesUp() {
    clearInterval(timerInterval);
    setTimeout(() => TIMER.classList.remove('beat'), 400);
    TIMER.classList.remove('counting')
}

function startTimer() {
    TIMER.setAttribute('data-before', TIME_LIMIT);
    setTimeout(() => TIMER.classList.add('beat'), 600);
    count();

    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        TIMER.setAttribute('data-before', TIME_LIMIT - timePassed);

        if (timeLeft === 0) {
            onTimesUp();
            return;
        }

        count();
    }, 1000);
}

var count = () => {
    TIMER.style = '--time-left: 0%';

    let time = UPDATE_INTERVAL;
    const intervalID = setInterval(() => {
        const passedTime = time / SECOND_IN_MS * 100;
        TIMER.style = `--time-left: ${passedTime}%`;

        time += UPDATE_INTERVAL;

        if (time > SECOND_IN_MS + UPDATE_INTERVAL ) {
            TIMER.style = '';
            
            clearInterval(intervalID);
        }
    }, UPDATE_INTERVAL);
}
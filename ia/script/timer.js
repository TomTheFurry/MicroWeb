const TIMER = document.getElementById('timer');

//count time
const TIME_LIMIT = 10;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

const SECOND_IN_MS = 1000;
const UPDATE_INTERVAL = SECOND_IN_MS / 60;

window.addEventListener("load", () => TIMER.setAttribute('data-before', TIME_LIMIT - timePassed))

function onTimesUp() {
    clearInterval(timerInterval);
    // remove class 'button' form game-box
    setTimeout(() => TIMER.classList.remove('beat'), 400);
    TIMER.classList.remove('counting')
}

function startTimer() {
    TIMER.setAttribute('data-before', TIME_LIMIT);
    setTimeout(() => TIMER.classList.add('beat'), 600);
    timerCount();

    timerInterval = setInterval(() => {
        timePassed = timePassed += 1;
        timeLeft = TIME_LIMIT - timePassed;
        TIMER.setAttribute('data-before', TIME_LIMIT - timePassed);

        if (timeLeft === 0) {
            onTimesUp();
            return;
        }

        timerCount();
    }, 1000);
}

var timerCount = (timeInMs = SECOND_IN_MS) => {
    TIMER.style = '--time-left: 0%';

    let time = UPDATE_INTERVAL;
    const intervalID = setInterval(() => {
        const passedTime = time / timeInMs * 100;
        TIMER.style = `--time-left: ${passedTime}%`;

        time += UPDATE_INTERVAL;

        if (time > timeInMs + UPDATE_INTERVAL ) {
            TIMER.style = '';
            
            clearInterval(intervalID);
        }
    }, UPDATE_INTERVAL);
}
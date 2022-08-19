const TIMER = document.getElementById('timer');

//count time
const TIME_LIMIT = 10 * 1000;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let intervalID = null;
let isRunning = false;


var totalTime = 0;

let startTime = Date.now();

const SECOND_IN_MS = 1000;
const UPDATE_INTERVAL = SECOND_IN_MS / 60;

window.addEventListener('load', () => setTime());

function timerInit(addTotalTime = false) {
    if (addTotalTime && isRunning) { totalTime +=  Date.now() - startTime; }
    isRunning = false;
    clearInterval(timerInterval);
    endCount();
    setTimeout(() => TIMER.classList.remove('beat'), 400);
    TIMER.classList.remove('counting');
}

function onTimesUp() {
    timerInit(true);
    gameTimeUp();
    setTimeout(() => startScorePage(true), 1000);
}

function startTimer(timeLimit = TIME_LIMIT) {
    if (isRunning) {
        timerInit();
    }

    startTime = Date.now();
    isRunning = true;
    setTime(timeLimit);
    setTimeout(() => TIMER.classList.add('beat'), 600);
    timerCount();

    timePassed = 0;
    timerInterval = setInterval(() => {
        timePassed = timePassed += 1000;
        timeLeft = timeLimit - timePassed;
        setTime(timeLimit - timePassed);

        if (timeLeft === 0) {
            onTimesUp();
            return;
        }

        timerCount();
    }, 1000);
}

var timerCount = (countTime = SECOND_IN_MS) => {
    TIMER.style = '--time-left: 0%';

    let time = UPDATE_INTERVAL;
    endCount();
    intervalID = setInterval(() => {
        const passedTime = time / countTime * 100;
        TIMER.style = `--time-left: ${passedTime}%`;

        time += UPDATE_INTERVAL;

        if (time > countTime + UPDATE_INTERVAL ) {
            TIMER.style = '';
            
            endCount();
        }
    }, UPDATE_INTERVAL);
}

var endCount = () => {
    TIMER.style = '--time-left: 0%';
    clearInterval(intervalID);
}

var setTime = (time = TIME_LIMIT) => {
    time /= 1000;
    TIMER.setAttribute('data-before', time);
}
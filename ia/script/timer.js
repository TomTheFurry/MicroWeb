var time = 60.0;
const timerCount = 50;
const timeBox = document.getElementById('time-frame').children[0];

function startTimer() {
	time = 60.0;
	setTimeout(timer, timerCount);
}

function timer() {
	time -= timerCount / 1000.0;
	timeBox.innerHTML = Math.ceil(time);

	if (time > 0.0) {
		setTimeout(timer, timerCount);
	}
}
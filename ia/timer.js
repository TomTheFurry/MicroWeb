var time = 60.0;
const timerCount = 50;
const timeFrame = document.getElementById('time-frame');

function startTimer() {
	time = 60.0;
	setTimeout(timer, timerCount);
}

function timer() {
	time -= timerCount / 1000.0;
	timeFrame.children[0].innerHTML = Math.ceil(time);

	if (time > 0.0) {
		setTimeout(timer, timerCount);
	}
}
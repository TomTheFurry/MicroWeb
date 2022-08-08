const BOUNS_SCORE = 30;
const CORRECT_SCORE = 10;

var score = 0;
var inputIncorrect = false;

var scoreInitLv = () => {
    inputIncorrect = false;
    scoreUpdate(0);
}

var scoreCorrect = () => {
    scoreUpdate(CORRECT_SCORE);
}

var scoreIncorrect = () => {
    inputIncorrect = true;
}

var scoreEndLv = () => {
    if (!inputIncorrect) {
        scoreUpdate(BOUNS_SCORE);
    }
}

var scoreUpdate = (s) => {
    score += s;
    let scoreBox = document.getElementsByClassName('score');
	for (let i=0; i<scoreBox.length; i++) {
		let e = scoreBox.item(i);
		e.innerHTML = score.toString();
	}
}
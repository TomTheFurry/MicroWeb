const BOUNS_SCORE = 30;
const CORRECT_SCORE = 10;
const INCORRECT_SCORE = -5;

var score = 0;
var inputIncorrect = false;

var scoreInitLv = () => {
    inputIncorrect = false;
    scoreUpdate(); // 0
}

var scoreCorrect = () => {
    scoreUpdate(CORRECT_SCORE);
}

var scoreIncorrect = () => {
    inputIncorrect = true;
    scoreUpdate(INCORRECT_SCORE);
}

var scoreEndLv = () => {
    if (!inputIncorrect) {
        scoreUpdate(BOUNS_SCORE);
    }
}

var scoreUpdate = (s = 0) => {
    score += s;
    let scoreBox = document.getElementsByClassName('score');
	for (let i=0; i<scoreBox.length; i++) {
		let e = scoreBox.item(i);
		e.innerHTML = score.toString();
	}
}
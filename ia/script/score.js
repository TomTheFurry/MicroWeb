const BOUNS_SCORE = 25;
const CORRECT_SCORE = 10;
const INCORRECT_SCORE = 0;

var score = 0;
var inputIncorrect = false;
var bonusMagnification = 1;

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
        scoreUpdate(BOUNS_SCORE * bonusMagnification);
        if (bonusMagnification < 4) { bonusMagnification += 1; }
    }
    else {
        bonusMagnification = 0;
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
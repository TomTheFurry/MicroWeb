const START_TIME = 7400;  // time before start
const LEVEL_TIME = 10000;  // time in 1 level

function promisify(f) {
	return function (...args) { // return a wrapper-function (*)
	  return new Promise((resolve, reject) => {
		function callback(err, result) { // our custom callback for f (**)
		  if (err) {
			reject(err);
		  } else {
			resolve(result);
		  }
		}
  
		args.push(callback); // append our custom callback to the end of f arguments
  
		f.call(this, ...args); // call the original function
	  });
	};
  }




function randInts(max: number, count: number) {
	var array : number[] = [];
	for (var i=0; i<max; i++) {
		array.push(i);
	}
	array = array.sort(() => Math.random()-0.5);
	var result : number[] = [];
	for (var i=0; i<count; i++) {
		result.push(array[i]);
	}
	return result;
}

function randBools(count: number) {
	var result : boolean[] = [];
	for (var i=0; i<count; i++) {
		result.push(Math.random() < 0.5);
	}
	return result;
}

var level = 1;

var answers = 4;
var gridSize = 4;
var appliedIcons = 4;

var icons: HTMLElement[] = [];
var mIcons: HTMLElement[] = [];
var mColorIcon : HTMLElement;
var boxes : HTMLElement[] = [];
var hintIconBox: HTMLElement;
var selectedIcons: number[];
var selectedBoxes: number[];
var selectedAnswers: number[];
var selectedAnswersIsColors: boolean[];

var successIndex = 0;
var inputAllowed = false;
var inputPaused = false;
var colors = ["#ff0088", "#005522", "#aa00ff", "#00bbff",
				"#ffbbee", "#ff5500", "#fff1e9", "#ddeeff",
				"#663300", "#ffff00", "#000088", "#747eff",
				"#aaff00", "#cc0000", "#00ffaa", "#888500"];

var cssDisabledTile = "tile-disabled";
var cssCorrectTile = "tile-correct";
var cssIncorrectTile = "tile-incorrect";

const delayed = function(ms : number) {
	return new Promise((res) => setTimeout(res, ms));
}

var startGame = function() {
	successIndex = 0;
	inputAllowed = false;
	inputPaused = false;
	selectedIcons = randInts(icons.length, appliedIcons);
	selectedBoxes = randInts(boxes.length, appliedIcons);
	
	var tmpColors: string[] = [];
	tmpColors = tmpColors.concat(colors);
	tmpColors = tmpColors.sort(() => Math.random()-0.5);
	selectedIcons.forEach((num, i) => {
		let e = boxes[selectedBoxes[i]].appendChild(icons[num]);
		//e.style.fill = colors[Math.floor(Math.random() * colors.length)];
		e.style.fill = tmpColors.pop();
	});
	boxes.forEach((e) => {
		e["clickable"] = true;
		e.classList.remove(cssIncorrectTile);
		e.classList.remove(cssCorrectTile);
	});
	// init score in new level
	this['scoreInitLv']();
	// set level display
	{
		let lvBox = document.getElementsByClassName('lv');
		for (let i=0; i<lvBox.length; i++) {
			let e = (lvBox.item(i) as HTMLElement);
			e.textContent = level.toString();
		}
	}
	
	selectedAnswers = randInts(appliedIcons, answers);
	selectedAnswersIsColors = randBools(answers);
	{
		console.log("selectedIcons: ", selectedIcons);
		console.log("selectedBoxes: ", selectedBoxes);
		console.log("selectedAnswers: ", selectedAnswers);
		console.log("selectedAnswersIsColors: ", selectedAnswersIsColors);
	}

	updateClickable();
	showIcons();
	this['setTime'](LEVEL_TIME);
	// this['timerCount'](START_TIME);
	{
		// set start count anim
		let startCount = document.getElementsByClassName('game-start-count');
		for (let i=0; i<startCount.length; i++) {
			let e = (startCount.item(i) as HTMLElement);
			e.setAttribute('style', `--count-time: ${START_TIME}ms;`);
			e.classList.add('count');
		}
	}
	const gameBox = document.getElementsByClassName("game-box")[0];
	Promise.race([delayed(START_TIME), new Promise(async (res) => {
		await delayed(300);
		gameBox.addEventListener("click", res, {once:true});
		(gameBox as HTMLElement).classList.add('pointer');
	})]).then(() => {
		hideIcons();
		(gameBox as HTMLElement).classList.remove('pointer');
		{
			// remove start count anim
			let startCount = document.getElementsByClassName('game-start-count');
			for (let i=0; i<startCount.length; i++) {
				let e = (startCount.item(i) as HTMLElement);
				e.classList.remove('count');
			}
		}
		inputAllowed = true;
		this['startTimer'](LEVEL_TIME);
		updateClickable();
		updateHintIcon();
	});
}

var initGame = function() {
	console.log("Game init");
	{
		var list = document.getElementsByClassName("game-box")[0]
		.getElementsByClassName("game-button");
		boxes = [];
		for (let i=0; i<list.length; i++) {
			let e = (list.item(i) as HTMLElement);
			boxes.push(e);
			e.addEventListener("touchstart", buttonOnClick);
			e.addEventListener("mousedown", buttonOnClick);
			e["boxId"] = i;
		}
	}
	
	{
		var list = document.getElementsByClassName("icons")[0]
		.getElementsByClassName("icon");
		icons = [];
		for (let i=0; i<list.length; i++) {
			let e = (list.item(i) as HTMLElement);
			icons.push(e);
		}
	}

	{
		var list = document.getElementsByClassName("mini-icons")[0]
			.getElementsByClassName("mini-icon");
		mIcons = [];
		for (let i = 0; i < list.length; i++) {
			let e = (list.item(i) as HTMLElement);
			mIcons.push(e);
		}
	}

	{
		mColorIcon = document.getElementById("color-icon") as HTMLElement;
	}
	hintIconBox = document.getElementById('tip-icon') as HTMLElement;
	startGame();
}

var buttonOnClick = function(ev : MouseEvent | TouchEvent) {
	if (!inputAllowed || inputPaused) return;
	let e = ev.target as HTMLElement;
	if (!e) throw new ReferenceError();
	if (e["boxId"] === undefined) return;
	if (e["clickable"] !== true) return;
	inputPaused = true;
	let i : number = e["boxId"];
	if (i == selectedBoxes[selectedAnswers[successIndex]]) {
		// correct
		if (e.childNodes[0]) {
			(e.childNodes[0] as HTMLElement).style.opacity = "1.0";
		}
		window['scoreCorrect']();  // score
		successIndex++;
		e["clickable"] = false;
		updateHintIcon();
		e.classList.add(cssCorrectTile);
		if (successIndex >= answers)
		{
			onWin();
		} else {
			inputPaused = false;
			updateClickable();
		}
	} else {
		// incorrect
		window['scoreIncorrect']();  // score
		window['addMistake']();  // mistake anim
		showClickableIcons();
		updateClickable();
		// incorrect anim
		new Promise(async() => {
			e.classList.add(cssIncorrectTile);
			await delayed(100);
			hideClickableIcons();
			await delayed(200);
			// e.style.backgroundColor = inputAllowed ? clickableColor : "";
			inputPaused = false;
			e.classList.remove(cssIncorrectTile);
			updateClickable();
		});
	}
}

var updateClickable = function() {
	boxes.forEach((e) => {
		if (inputAllowed && !inputPaused && (e["clickable"] === true)) {
			if (e.classList.contains(cssDisabledTile)) e.classList.remove(cssDisabledTile)
		} else {
			if (!e.classList.contains(cssDisabledTile)) e.classList.add(cssDisabledTile);
		}
	})
}

var showIcons = function() {
	icons.forEach((e) => {
		e.style.opacity = "1.0";
	})
}
var hideIcons = function() {
	icons.forEach((e) => {
		e.style.opacity = "0.0";
	})
}
var showClickableIcons = function() {
	boxes.forEach((e) => {
		if (e['clickable'] && e.childNodes[0]) {
			(e.childNodes[0] as HTMLElement).style.opacity = "1.0";
		};
	})
}
var hideClickableIcons = function() {
	boxes.forEach((e) => {
		if (e['clickable'] && e.childNodes[0]) {
			(e.childNodes[0] as HTMLElement).style.opacity = "0.0";
		};
	})
}

var updateHintIcon = function() {
	if (hintIconBox.children.length != 0) {
		hintIconBox.removeChild(hintIconBox.children[0]);
	}
	if (successIndex < answers) {
		var e : HTMLElement;
		if (selectedAnswersIsColors[successIndex]) {
			e = mColorIcon;
			e.style.fill = icons[selectedIcons[selectedAnswers[successIndex]]].style.fill;
		}
		else {
			e = mIcons[selectedIcons[selectedAnswers[successIndex]]];
			e.style.fill = "#fff";
		}

		hintIconBox.appendChild(e);
	}
}

function onWin() {
	showIcons();
	updateClickable();
	this['timerInit']();
	// time count anim
	this['timerCount'](1000);
	// score
	this['scoreEndLv']();
	const gameBox = document.getElementsByClassName("game-box")[0];
	Promise.race([delayed(1000), new Promise(async (res) => {
		await delayed(300);
		gameBox.addEventListener("click", res, {once:true});
		(gameBox as HTMLElement).classList.add('pointer');
	})]).then(async () => {
		hideIcons();
		(gameBox as HTMLElement).classList.remove('pointer');
		await delayed(300);
		boxes.forEach((e) => {
			e.style.backgroundColor = "";
			if (e.children[0]) {
				e.removeChild(e.children[0]);
			}
		})
		if (appliedIcons < gridSize * gridSize) {
			appliedIcons += 1;
		}
		level += 1;
		window['healMistake']();
		startGame();
	});
}

function gameTimeUp() {
	inputAllowed = false;
	boxes.forEach((e) => {
		if (e['clickable'])
			e.style.backgroundColor = "";
	});
	updateClickable();
	showIcons();
	delayed(4000).then(() => {
		const gameBox = document.getElementsByClassName("game-box")[0];
		(gameBox as HTMLElement).classList.add('pointer');
		gameBox.addEventListener("click", () => {
			console.log("Reloading levels");
			window.location.reload();
		}, {once:true});
	});
}

function uploadGameResult(name : string) {
	// pass data to server
	new Promise(async () => {
		let entry = {
			score: window['score'],
			duration: window['totalTime'],
			name: btoa(encodeURIComponent(name)),
			level: level
		}
		console.log(entry)
		let jsonStr = JSON.stringify({postType: "time", entry: entry});
		let request = new Request("", { method: 'POST', body: jsonStr});
		let response = await fetch(request);
		let resObj = JSON.parse(await response.text());
		let topNArray = resObj.scoreboard;
		
		console.log(topNArray);
		topNArray.forEach((e) => {
			console.log(e);
			console.log(decodeURIComponent(atob(e.name)))
		})
	})
}
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

var answers = 4;
var gridSize = 4;
var appliedIcons = 4;

var icons: HTMLElement[] = [];
var mIcons: HTMLElement[] = [];
var boxes : HTMLElement[] = [];
var hintIconBox: HTMLElement;
var selectedIcons: number[];
var selectedBoxes: number[];
var selectedAnswers: number[];

var successIndex = 0;
var inputAllowed = false;
var colors = ["#000000", "#ff0000", "#ffff00", "#aaff00", 
				"#00bbff", "#0000ff", "#ff0088", "#ff5500", 
				"#663300", "#005522", "#aa00ff", "#ccbb99", 
				"#009944", "#776655", "#770000", "#ffbbee"];

var startGame = function() {
	successIndex = 0;
	inputAllowed = false;
	selectedIcons = randInts(icons.length, appliedIcons);
	selectedBoxes = randInts(boxes.length, appliedIcons);
	
	selectedIcons.forEach((num, i) => {
		let e = boxes[selectedBoxes[i]].appendChild(icons[num]);
		e.style.fill = colors[Math.floor(Math.random() * colors.length)];
	});
	boxes.forEach((e) => {
		e["clickable"] = true;
	});
	
	selectedAnswers = randInts(appliedIcons, answers);
	console.log("selectedIcons: ", selectedIcons);
	console.log("selectedBoxes: ", selectedBoxes);
	console.log("selectedAnswers: ", selectedAnswers);

	updateClickable();
	showIcons();
	this['timerCount'](3300);
	setTimeout(() => {
		hideIcons();
		inputAllowed = true;
		this['startTimer']();
		updateClickable();
		updateHintIcon();
	}, 3300);
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
		var list = document.getElementsByClassName("boxes")[0]
		.getElementsByClassName("box");
		icons = [];
		for (let i=0; i<list.length; i++) {
			let e = (list.item(i) as HTMLElement);
			// e.style.stroke = "black";
            // e.style.strokeWidth = "2px";
            // e.style.strokeLinecap = "round";
            e.style.filter = "drop-shadow(-1px 1px 3px #0006)";
			icons.push(e);
		}
	}

	{
		var list = document.getElementsByClassName("mini-boxes")[0]
			.getElementsByClassName("mini-box");
		mIcons = [];
		for (let i = 0; i < list.length; i++) {
			let e = (list.item(i) as HTMLElement);
			e.style.stroke = "black";
			e.style.strokeWidth = "2px";
			e.style.strokeLinecap = "round";
			mIcons.push(e);
		}
	}
	hintIconBox = document.getElementsByClassName("icon-bar")[0].children[0] as HTMLElement;
	startGame();
}

var buttonOnClick = function(ev : MouseEvent | TouchEvent) {
	if (!inputAllowed) return;
	let e = ev.target as HTMLElement;
	if (!e) throw new ReferenceError();
	if (e["boxId"] === undefined) return;
	if (e["clickable"] !== true) return;
	inputAllowed = false;
	if (e.childNodes[0]) {
		(e.childNodes[0] as HTMLElement).hidden = false;
	}
	let i : number = e["boxId"];
	if (i == selectedBoxes[selectedAnswers[successIndex]]) {
		successIndex++;
		e["clickable"] = false;
		updateHintIcon();
		e.style.backgroundColor = "#b3ffb3";
		if (successIndex >= answers)
		{
			onWin();
		} else {
			inputAllowed = true;
			updateClickable();
		}
	} else {
		e.style.backgroundColor = "#ff6666";
		updateClickable();
		setTimeout(() => {
			if (e.childNodes[0]) {
				(e.childNodes[0] as HTMLElement).hidden = true;
			}
			e.style.backgroundColor = "";
			inputAllowed = true;
			updateClickable();
		}, 300);
	}
}

var updateClickable = function() {
	boxes.forEach((e) => {
		if (inputAllowed && (e["clickable"] === true)) {
			if (e.classList.contains("disable")) e.classList.remove("disable")
		} else {
			if (!e.classList.contains("disable")) e.classList.add("disable");
		}
	})
}

var showIcons = function() {
	icons.forEach((e) => {
		e.hidden = false;
	})
}
var hideIcons = function() {
	icons.forEach((e) => {
		e.hidden = true;
	})
}

var updateHintIcon = function() {
	if (hintIconBox.children.length != 0) {
		hintIconBox.removeChild(hintIconBox.children[0]);
	}
	if (successIndex < answers) {
		var e : HTMLElement = mIcons[selectedIcons[selectedAnswers[successIndex]]];
		if (e === undefined) {
			debugger;
		}
		e.style.fill = icons[selectedIcons[selectedAnswers[successIndex]]].style.fill;
		hintIconBox.appendChild(e);
	}
}

function onWin() {
	showIcons();
	updateClickable();
	setTimeout(() => {
		boxes.forEach((e) => {
			e.style.backgroundColor = "";
			if (e.children[0]) {
				e.removeChild(e.children[0]);
			}
		})
		appliedIcons+=1;
		startGame();
	})
}
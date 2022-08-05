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

var answer : number[];
var answers = 4;
var gridSize = 4;
var appliedIcons = 16;

var icons: HTMLElement[] = [];
var mIcons: HTMLElement[] = [];
var boxes : HTMLElement[] = [];

var successIndex = 0;
var started = false;
var colors = ["red", "green", "blue", "yellow"];

var initGame = function() {
	console.log("Game init")
	let boxCount = gridSize*gridSize;
	answer = randInts(boxCount, answers);
	console.log(answer);
	{
		var list = document.getElementsByClassName("game-box")[0]
		.getElementsByClassName("game-button");
		boxes = [];
		for (let i=0; i<list.length; i++) {
			let e = (list.item(i) as HTMLElement);
			boxes.push(e);
			e.addEventListener("click", buttonOnClick);
			e["boxId"] = i;
		}
	}
	
	{
		var list = document.getElementsByClassName("boxes")[0]
		.getElementsByClassName("box");
		icons = [];
		for (let i=0; i<list.length; i++) {
			let e = (list.item(i) as HTMLElement);
			icons.push(e);
		}
	}

	{
		var list = document.getElementsByClassName("mini-boxes")[0]
			.getElementsByClassName("mini-box");
		mIcons = [];
		for (let i = 0; i < list.length; i++) {
			let e = (list.item(i) as HTMLElement);
			mIcons.push(e);
		}
	}
	successIndex = 0;

	let selectedIcons = randInts(icons.length, appliedIcons);
	let selectedBoxes = randInts(boxes.length, appliedIcons);
	
	selectedIcons.forEach((num, i) => {
		let e = boxes[selectedBoxes[i]].appendChild(icons[num]);
		e.style.fill = colors[Math.floor(Math.random() * colors.length)];
	});

	showIcons();
	setTimeout(() => {
		hideIcons();
		started = true;
		this['startTimer']();
	}, 3000);
}

var buttonOnClick = function(ev : MouseEvent) {
	if (!started) return;
	let e = ev.target as HTMLElement;
	if (!e) throw new ReferenceError();
	if (e.childNodes[0]) {
		(e.childNodes[0] as HTMLElement).hidden = false;
	}
	let i : number = e["boxId"];
	if (i == answer[successIndex]) {
		successIndex++;
		e.style.backgroundColor = "#b3ffb3";
		if (successIndex >= answers)
		{
			window.prompt("You Win!");
			//setTimeout(window.location.reload, 500);;
		}
	} else {
		e.style.backgroundColor = "#ff6666";
		//window.prompt("Wrong!");
		//setTimeout(window.location.reload, 500);
	}
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


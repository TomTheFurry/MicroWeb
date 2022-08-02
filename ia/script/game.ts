function randInts(max: number, count: number) {
	var array : Number[] = [];
	for (var i=0; i<max; i++) {
		array.push(i);
	}
	array = array.sort(() => Math.random()-0.5);
	var result : Number[] = [];
	for (var i=0; i<count; i++) {
		result.push(array[i]);
	}
	return result;
}

var answer : Number[];
var answers = 4;
var gridSize = 4;

var icons : HTMLElement[] = [];
var boxes : HTMLElement[] = [];

var successIndex = 0;
var started = false;

var init = function() {
	let boxCount = gridSize*gridSize;
	answer = randInts(boxCount, answers);
	var list = document.getElementsByClassName("game-box")[0]
	.getElementsByClassName("game-button");
	icons = [];
	for (let i=0; i<list.length; i++) {
		icons.push(list.item(i) as HTMLElement);
	}
	
	for (let i=0; i<boxCount; i++) {
		let e = document.getElementById("Box"+i);
		e.onclick = buttonOnClick;
		boxes.push(e);
		e["boxId"] = i;
	}
	successIndex = 0;
	showIcons();
	setTimeout(() => {
		hideIcons();
		started = true;
	}, 1000);
}

var buttonOnClick = function(ev : MouseEvent) {
	if (!started) return;
	let i : Number = ev.target["boxId"];
	if (i == answer[successIndex]) {
		successIndex++;
		(ev.target as HTMLElement).style.color = "#b3ffb3";
		if (successIndex >= answers)
		{
			window.prompt("You Win!");
			setTimeout(window.location.reload, 500);;
		}
	} else {
		(ev.target as HTMLElement).style.color = "#ff6666";
		window.prompt("Wrong!");
		setTimeout(window.location.reload, 500);
	}
}

var showIcons = function() {
	icons.forEach((e,i) => {
		boxes[i].appendChild(e);
		e.hidden = false;
	})
}
var hideIcons = function() {
	icons.forEach((e,i) => {
		e.hidden = true;
		if (e.parentElement) {
			e.parentElement.removeChild(e);
		}
	})
}

window.onload = init;


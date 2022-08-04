function randInts(max, count) {
    var array = [];
    for (var i = 0; i < max; i++) {
        array.push(i);
    }
    array = array.sort(function () { return Math.random() - 0.5; });
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push(array[i]);
    }
    return result;
}
var answer;
var answers = 4;
var gridSize = 4;
var appliedIcons = 16;
var icons = [];
var boxes = [];
var successIndex = 0;
var started = false;
var colors = ["red", "green", "blue", "yellow"];
var initGame = function () {
    var _this = this;
    console.log("Game init");
    var boxCount = gridSize * gridSize;
    answer = randInts(boxCount, answers);
    console.log(answer);
    {
        var list = document.getElementsByClassName("game-box")[0]
            .getElementsByClassName("game-button");
        boxes = [];
        for (var i = 0; i < list.length; i++) {
            var e = list.item(i);
            boxes.push(e);
            e.addEventListener("click", buttonOnClick);
            e["boxId"] = i;
        }
    }
    {
        var list = document.getElementsByClassName("boxes")[0]
            .getElementsByClassName("box");
        icons = [];
        for (var i = 0; i < list.length; i++) {
            var e = list.item(i);
            icons.push(e);
        }
    }
    successIndex = 0;
    var selectedIcons = randInts(icons.length, appliedIcons);
    var selectedBoxes = randInts(boxes.length, appliedIcons);
    selectedIcons.forEach(function (num, i) {
        var e = boxes[selectedBoxes[i]].appendChild(icons[num]);
        e.style.fill = colors[Math.floor(Math.random() * colors.length)];
    });
    showIcons();
    setTimeout(function () {
        hideIcons();
        started = true;
        _this['startTimer']();
    }, 3000);
};
var buttonOnClick = function (ev) {
    if (!started)
        return;
    var e = ev.target;
    if (!e)
        throw new ReferenceError();
    if (e.childNodes[0]) {
        e.childNodes[0].hidden = false;
    }
    var i = e["boxId"];
    if (i == answer[successIndex]) {
        successIndex++;
        e.style.backgroundColor = "#b3ffb3";
        if (successIndex >= answers) {
            window.prompt("You Win!");
            //setTimeout(window.location.reload, 500);;
        }
    }
    else {
        e.style.backgroundColor = "#ff6666";
        //window.prompt("Wrong!");
        //setTimeout(window.location.reload, 500);
    }
};
var showIcons = function () {
    icons.forEach(function (e) {
        e.hidden = false;
    });
};
var hideIcons = function () {
    icons.forEach(function (e) {
        e.hidden = true;
    });
};

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
var answers = 4;
var gridSize = 4;
var appliedIcons = 4;
var icons = [];
var mIcons = [];
var boxes = [];
var hintIconBox;
var selectedIcons;
var selectedBoxes;
var selectedAnswers;
var successIndex = 0;
var inputAllowed = false;
var colors = ["#000000", "#ff0000", "#ffff00", "#aaff00",
    "#00bbff", "#0000ff", "#ff0088", "#ff5500",
    "#663300", "#005522", "#aa00ff", "#ccbb99",
    "#009944", "#776655", "#770000", "#ffbbee"];
var startGame = function () {
    var _this = this;
    successIndex = 0;
    selectedIcons = randInts(icons.length, appliedIcons);
    selectedBoxes = randInts(boxes.length, appliedIcons);
    selectedIcons.forEach(function (num, i) {
        var e = boxes[selectedBoxes[i]].appendChild(icons[num]);
        e.style.fill = colors[Math.floor(Math.random() * colors.length)];
    });
    selectedAnswers = randInts(appliedIcons, answers);
    console.log("selectedIcons: ", selectedIcons);
    console.log("selectedBoxes: ", selectedBoxes);
    console.log("selectedAnswers: ", selectedAnswers);
    showIcons();
    this['timerCount'](3300);
    setTimeout(function () {
        hideIcons();
        inputAllowed = true;
        _this['startTimer']();
    }, 3300);
};
var initGame = function () {
    console.log("Game init");
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
            e.style.stroke = "black";
            e.style.strokeWidth = "2px";
            e.style.strokeLinecap = "round";
            icons.push(e);
        }
    }
    {
        var list = document.getElementsByClassName("mini-boxes")[0]
            .getElementsByClassName("mini-box");
        mIcons = [];
        for (var i = 0; i < list.length; i++) {
            var e = list.item(i);
            e.style.stroke = "black";
            e.style.strokeWidth = "2px";
            e.style.strokeLinecap = "round";
            mIcons.push(e);
        }
    }
    hintIconBox = document.getElementsByClassName("icon-bar")[0].children[0];
    startGame();
};
var buttonOnClick = function (ev) {
    if (!inputAllowed)
        return;
    var e = ev.target;
    if (!e)
        throw new ReferenceError();
    if (e["boxId"] === undefined)
        return;
    inputAllowed = false;
    if (e.childNodes[0]) {
        e.childNodes[0].hidden = false;
    }
    var i = e["boxId"];
    if (i == selectedBoxes[selectedAnswers[successIndex]]) {
        successIndex++;
        updateHintIcon();
        e.style.backgroundColor = "#b3ffb3";
        if (successIndex >= answers) {
            onWin();
        }
        else {
            inputAllowed = true;
        }
    }
    else {
        e.style.backgroundColor = "#ff6666";
        setTimeout(function () {
            if (e.childNodes[0]) {
                e.childNodes[0].hidden = true;
            }
            e.style.backgroundColor = "";
            inputAllowed = true;
        }, 300);
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
var updateHintIcon = function () {
    if (hintIconBox.children.length != 0) {
        hintIconBox.removeChild(hintIconBox.children[0]);
    }
    if (successIndex < answers) {
        var e = mIcons[selectedIcons[selectedAnswers[successIndex]]];
        e.style.fill = icons[selectedIcons[selectedAnswers[successIndex]]].style.fill;
        hintIconBox.appendChild(e);
    }
};
function onWin() {
    showIcons();
    setTimeout(function () {
        boxes.forEach(function (e) {
            e.style.backgroundColor = "";
            if (e.children[0]) {
                e.removeChild(e.children[0]);
            }
        });
        appliedIcons += 1;
        startGame();
    });
}

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
function randBools(count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push(Math.random() < 0.5);
    }
    return result;
}
var level = 1;
var answers = 4;
var gridSize = 4;
var appliedIcons = 4;
var icons = [];
var mIcons = [];
var mColorIcon;
var boxes = [];
var hintIconBox;
var selectedIcons;
var selectedBoxes;
var selectedAnswers;
var selectedAnswersIsColors;
var successIndex = 0;
var inputAllowed = false;
var inputPaused = false;
var colors = ["#000000", "#ff0000", "#ffff00", "#aaff00",
    "#00bbff", "#0000ff", "#ff0088", "#ff5500",
    "#663300", "#005522", "#aa00ff", "#ccbb99",
    "#009944", "#776655", "#770000", "#ffbbee"];
var clickableColor = "#eeeeee";
var startGame = function () {
    var _this = this;
    successIndex = 0;
    inputAllowed = false;
    inputPaused = false;
    selectedIcons = randInts(icons.length, appliedIcons);
    selectedBoxes = randInts(boxes.length, appliedIcons);
    var tmpColors = [];
    tmpColors = tmpColors.concat(colors);
    tmpColors = tmpColors.sort(function () { return Math.random() - 0.5; });
    selectedIcons.forEach(function (num, i) {
        var e = boxes[selectedBoxes[i]].appendChild(icons[num]);
        // e.style.fill = colors[Math.floor(Math.random() * colors.length)];
        e.style.fill = tmpColors.pop();
    });
    boxes.forEach(function (e) {
        e["clickable"] = true;
    });
    // init score in new level
    this['scoreInitLv']();
    // set level display
    var lvBox = document.getElementsByClassName('lv');
    for (var i = 0; i < lvBox.length; i++) {
        var e = lvBox.item(i);
        e.innerHTML = level.toString();
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
    this['setTime'](10000);
    this['timerCount'](3300);
    setTimeout(function () {
        hideIcons();
        inputAllowed = true;
        boxes.forEach(function (e) {
            e.style.backgroundColor = clickableColor;
        });
        _this['startTimer']();
        updateClickable();
        updateHintIcon();
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
            e.addEventListener("touchstart", buttonOnClick);
            e.addEventListener("mousedown", buttonOnClick);
            e["boxId"] = i;
        }
    }
    {
        var list = document.getElementsByClassName("boxes")[0]
            .getElementsByClassName("box");
        icons = [];
        for (var i = 0; i < list.length; i++) {
            var e = list.item(i);
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
        for (var i = 0; i < list.length; i++) {
            var e = list.item(i);
            // e.style.stroke = "black";
            // e.style.strokeWidth = "2px";
            // e.style.strokeLinecap = "round";
            e.style.filter = "drop-shadow(-1px 1px 3px #0006)";
            mIcons.push(e);
        }
    }
    {
        mColorIcon = document.getElementById("color-icon");
    }
    hintIconBox = document.getElementsByClassName("icon-bar")[0].children[0];
    startGame();
};
var buttonOnClick = function (ev) {
    if (!inputAllowed || inputPaused)
        return;
    var e = ev.target;
    if (!e)
        throw new ReferenceError();
    if (e["boxId"] === undefined)
        return;
    if (e["clickable"] !== true)
        return;
    inputPaused = true;
    if (e.childNodes[0]) {
        e.childNodes[0].style.opacity = "1.0";
    }
    var i = e["boxId"];
    if (i == selectedBoxes[selectedAnswers[successIndex]]) {
        // correct
        window['scoreCorrect'](); // score
        successIndex++;
        e["clickable"] = false;
        updateHintIcon();
        e.style.backgroundColor = "#b3ffb3";
        if (successIndex >= answers) {
            onWin();
        }
        else {
            inputPaused = false;
            updateClickable();
        }
    }
    else {
        // incorrect
        window['scoreIncorrect'](); // score
        e.style.backgroundColor = "#ff6666";
        updateClickable();
        setTimeout(function () {
            if (e.childNodes[0]) {
                e.childNodes[0].style.opacity = "0.0";
            }
            e.style.backgroundColor = clickableColor;
            inputPaused = false;
            updateClickable();
        }, 500);
    }
};
var updateClickable = function () {
    boxes.forEach(function (e) {
        if (inputAllowed && !inputPaused && (e["clickable"] === true)) {
            if (e.classList.contains("disable"))
                e.classList.remove("disable");
        }
        else {
            if (!e.classList.contains("disable"))
                e.classList.add("disable");
        }
    });
};
var showIcons = function () {
    icons.forEach(function (e) {
        e.style.opacity = "1.0";
    });
};
var hideIcons = function () {
    icons.forEach(function (e) {
        e.style.opacity = "0.0";
    });
};
var updateHintIcon = function () {
    if (hintIconBox.children.length != 0) {
        hintIconBox.removeChild(hintIconBox.children[0]);
    }
    if (successIndex < answers) {
        var e;
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
};
function onWin() {
    inputAllowed = false;
    boxes.forEach(function (e) {
        if (e['clickable'])
            e.style.backgroundColor = "";
    });
    showIcons();
    updateClickable();
    this['onTimesUp']();
    // time count anim
    this['timerCount'](1000);
    // score
    this['scoreEndLv']();
    setTimeout(function () {
        boxes.forEach(function (e) {
            e.style.backgroundColor = "";
            if (e.children[0]) {
                e.removeChild(e.children[0]);
            }
        });
        appliedIcons += 1;
        level += 1;
        startGame();
    }, 1000);
}
function gameTimeUp() {
    inputAllowed = false;
    boxes.forEach(function (e) {
        if (e.style.backgroundColor == clickableColor)
            e.style.backgroundColor = "";
    });
    updateClickable();
    showIcons();
}

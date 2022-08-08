var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function promisify(f) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            function callback(err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            }
            args.push(callback);
            f.call(this, ...args);
        });
    };
}
function randInts(max, count) {
    var array = [];
    for (var i = 0; i < max; i++) {
        array.push(i);
    }
    array = array.sort(() => Math.random() - 0.5);
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
var clickableColor = "#e8e8e8";
const delayed = function (ms) {
    return new Promise((res) => setTimeout(res, ms));
};
var startGame = function () {
    successIndex = 0;
    inputAllowed = false;
    inputPaused = false;
    selectedIcons = randInts(icons.length, appliedIcons);
    selectedBoxes = randInts(boxes.length, appliedIcons);
    var tmpColors = [];
    tmpColors = tmpColors.concat(colors);
    tmpColors = tmpColors.sort(() => Math.random() - 0.5);
    selectedIcons.forEach((num, i) => {
        let e = boxes[selectedBoxes[i]].appendChild(icons[num]);
        e.style.fill = tmpColors.pop();
    });
    boxes.forEach((e) => {
        e["clickable"] = true;
    });
    this['scoreInitLv']();
    let lvBox = document.getElementsByClassName('lv');
    for (let i = 0; i < lvBox.length; i++) {
        let e = lvBox.item(i);
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
    Promise.race([delayed(3300), new Promise((res) => {
            const e = document.getElementsByClassName("game-box")[0];
            e.addEventListener("click", res, { once: true });
        })]).then(() => {
        hideIcons();
        inputAllowed = true;
        boxes.forEach((e) => {
            e.style.backgroundColor = clickableColor;
        });
        this['startTimer']();
        updateClickable();
        updateHintIcon();
    });
};
var initGame = function () {
    console.log("Game init");
    {
        var list = document.getElementsByClassName("game-box")[0]
            .getElementsByClassName("game-button");
        boxes = [];
        for (let i = 0; i < list.length; i++) {
            let e = list.item(i);
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
        for (let i = 0; i < list.length; i++) {
            let e = list.item(i);
            e.style.filter = "drop-shadow(-1px 1px 3px #0006)";
            icons.push(e);
        }
    }
    {
        var list = document.getElementsByClassName("mini-boxes")[0]
            .getElementsByClassName("mini-box");
        mIcons = [];
        for (let i = 0; i < list.length; i++) {
            let e = list.item(i);
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
    let e = ev.target;
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
    let i = e["boxId"];
    if (i == selectedBoxes[selectedAnswers[successIndex]]) {
        window['scoreCorrect']();
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
        window['scoreIncorrect']();
        e.style.backgroundColor = "#ff6666";
        updateClickable();
        setTimeout(() => {
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
    boxes.forEach((e) => {
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
    icons.forEach((e) => {
        e.style.opacity = "1.0";
    });
};
var hideIcons = function () {
    icons.forEach((e) => {
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
    showIcons();
    updateClickable();
    this['timerInit']();
    this['timerCount'](1000);
    this['scoreEndLv']();
    Promise.race([delayed(1000), new Promise((res) => {
            const e = document.getElementsByClassName("game-box")[0];
            setTimeout(() => e.addEventListener("click", res, { once: true }), 100);
        })]).then(() => __awaiter(this, void 0, void 0, function* () {
        hideIcons();
        yield delayed(300);
        boxes.forEach((e) => {
            e.style.backgroundColor = "";
            if (e.children[0]) {
                e.removeChild(e.children[0]);
            }
        });
        appliedIcons += 1;
        level += 1;
        startGame();
    }));
}
function gameTimeUp() {
    inputAllowed = false;
    boxes.forEach((e) => {
        if (e['clickable'])
            e.style.backgroundColor = "";
    });
    updateClickable();
    showIcons();
    delayed(1000).then(() => {
        const e = document.getElementsByClassName("game-box")[0];
        e.addEventListener("click", () => {
            console.log("Reloading levels");
            window.location.reload();
        }, { once: true });
    });
}
//# sourceMappingURL=game.js.map
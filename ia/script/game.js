var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const START_TIME = 3300;
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
    "#009944", "#776655", "#ddeeff", "#ffbbee"];
var clickableColor = "#e2e2e2";
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
        e.classList.remove('correct');
        e.classList.remove('incorrect');
    });
    this['scoreInitLv']();
    {
        let lvBox = document.getElementsByClassName('lv');
        for (let i = 0; i < lvBox.length; i++) {
            let e = lvBox.item(i);
            e.innerHTML = level.toString();
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
    this['setTime'](10000);
    {
        let startCount = document.getElementsByClassName('game-start-count');
        for (let i = 0; i < startCount.length; i++) {
            let e = startCount.item(i);
            e.setAttribute('style', `--count-time: ${START_TIME}ms;`);
            e.classList.add('count');
        }
    }
    const gameBox = document.getElementsByClassName("game-box")[0];
    Promise.race([delayed(START_TIME), new Promise((res) => __awaiter(this, void 0, void 0, function* () {
            yield delayed(300);
            gameBox.addEventListener("click", res, { once: true });
            gameBox.classList.add('pointer');
        }))]).then(() => {
        hideIcons();
        gameBox.classList.remove('pointer');
        {
            let startCount = document.getElementsByClassName('game-start-count');
            for (let i = 0; i < startCount.length; i++) {
                let e = startCount.item(i);
                e.classList.remove('count');
            }
        }
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
    let i = e["boxId"];
    if (i == selectedBoxes[selectedAnswers[successIndex]]) {
        if (e.childNodes[0]) {
            e.childNodes[0].style.opacity = "1.0";
        }
        window['scoreCorrect']();
        successIndex++;
        e["clickable"] = false;
        updateHintIcon();
        e.style.backgroundColor = "#b3ffb3";
        e.classList.add('correct');
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
        showClickableIcons();
        updateClickable();
        new Promise(() => __awaiter(this, void 0, void 0, function* () {
            e.classList.add('incorrect');
            yield delayed(100);
            hideClickableIcons();
            yield delayed(200);
            e.style.backgroundColor = inputAllowed ? clickableColor : "";
            inputPaused = false;
            e.classList.remove('incorrect');
            updateClickable();
        }));
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
var showClickableIcons = function () {
    boxes.forEach((e) => {
        if (e['clickable'] && e.childNodes[0]) {
            e.childNodes[0].style.opacity = "1.0";
        }
        ;
    });
};
var hideClickableIcons = function () {
    boxes.forEach((e) => {
        if (e['clickable'] && e.childNodes[0]) {
            e.childNodes[0].style.opacity = "0.0";
        }
        ;
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
    const gameBox = document.getElementsByClassName("game-box")[0];
    Promise.race([delayed(1000), new Promise((res) => __awaiter(this, void 0, void 0, function* () {
            yield delayed(300);
            gameBox.addEventListener("click", res, { once: true });
            gameBox.classList.add('pointer');
        }))]).then(() => __awaiter(this, void 0, void 0, function* () {
        hideIcons();
        gameBox.classList.remove('pointer');
        yield delayed(300);
        boxes.forEach((e) => {
            e.style.backgroundColor = "";
            if (e.children[0]) {
                e.removeChild(e.children[0]);
            }
        });
        if (appliedIcons < gridSize * gridSize) {
            appliedIcons += 1;
        }
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
    delayed(4000).then(() => {
        const gameBox = document.getElementsByClassName("game-box")[0];
        gameBox.classList.add('pointer');
        gameBox.addEventListener("click", () => {
            console.log("Reloading levels");
            window.location.reload();
        }, { once: true });
    });
}
//# sourceMappingURL=game.js.map
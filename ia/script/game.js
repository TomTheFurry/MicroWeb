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
var icons = [];
var boxes = [];
var successIndex = 0;
var started = false;
var init = function () {
    var boxCount = gridSize * gridSize;
    answer = randInts(boxCount, answers);
    var list = document.getElementsByClassName("game-box")[0]
        .getElementsByClassName("game-button");
    icons = [];
    for (var i = 0; i < list.length; i++) {
        icons.push(list.item(i));
    }
    for (var i = 0; i < boxCount; i++) {
        var e = document.getElementById("Box" + i);
        e.onclick = buttonOnClick;
        boxes.push(e);
        e["boxId"] = i;
    }
    successIndex = 0;
    showIcons();
    setTimeout(function () {
        hideIcons();
        started = true;
    }, 1000);
};
var buttonOnClick = function (ev) {
    if (!started)
        return;
    var i = ev.target["boxId"];
    if (i == answer[successIndex]) {
        successIndex++;
        ev.target.style.color = "#b3ffb3";
        if (successIndex >= answers) {
            window.prompt("You Win!");
            setTimeout(window.location.reload, 500);
            ;
        }
    }
    else {
        ev.target.style.color = "#ff6666";
        window.prompt("Wrong!");
        setTimeout(window.location.reload, 500);
    }
};
var showIcons = function () {
    icons.forEach(function (e, i) {
        boxes[i].appendChild(e);
        e.hidden = false;
    });
};
var hideIcons = function () {
    icons.forEach(function (e, i) {
        e.hidden = true;
        if (e.parentElement) {
            e.parentElement.removeChild(e);
        }
    });
};
window.onload = init;

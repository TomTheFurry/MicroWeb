const hideAllPage = () => {
    const MAIN_BOX = document.getElementsByClassName('main-box');
    for (let i = 0; i < MAIN_BOX.length; ++i) {
        let e = MAIN_BOX.item(i);
        e.classList.add('disable');
    }
}

const showPage = (e) => {
    hideAllPage();
    e.classList.remove('disable');
}

const startPage = (idx) => {
    if (idx === 1) {
        startGamePage();
    }
    else if (idx === 2) {
        startScorePage();
    }
}


const GAME_BOX = document.getElementById('game-box');
const SCORE_BOX = document.getElementById('score-box');
const MISTAKES = document.getElementsByClassName('mistake-icon');
var mistakeIdx = 0;

// pass data to server
// {
//     let entry = {
//         score: 40,
//         duration: 10,
//         name: btoa(encodeURIComponent('分配')),
//         level: 1
//     }
//     let jsonStr = JSON.stringify({postType: "time", entry: entry});
//     let request = new Request("", { method: 'POST', body: jsonStr});
//     let response = await fetch(request);
//     let resObj = JSON.parse(await response.text());
//     let topNArray = resObj.scoreboard;
    
//     console.log(topNArray);
//     topNArray.forEach((e) => {
//         console.log(e);
//         console.log(decodeURIComponent(atob(e.name)))
//     })

// }

const startGamePage = async () => {
    showPage(GAME_BOX);

    let intro = GAME_BOX.querySelector('.intro');
    // let logo = GAME_BOX.querySelector('.logo-header');
    let logoSpan = GAME_BOX.querySelectorAll('.logo');

    logoSpan.forEach((span, idx) => {
        setTimeout(() => {
            span.classList.add('active');
        }, (idx + 1) * 50)
    });
    new Promise(async () => {
        await delayed(logoSpan.length * 50 + 920);
        logoSpan.forEach((span, idx) => {
            span.classList.remove('active');
            span.classList.add('fade'); // fade time in style.css '.logo.fade'
        });
        await delayed(150);
        intro.classList.add('fade');
        initGame();
    });
}

const startScorePage = async () => {
    await initScorePage();
    // show page
    showPage(SCORE_BOX);

    let intro = SCORE_BOX.querySelector('.intro');
    // let logo = SCORE_BOX.querySelector('.logo-header');
    let logoSpan = SCORE_BOX.querySelectorAll('.logo');

    logoSpan.forEach((span, idx) => {
        setTimeout(() => {
            span.classList.add('active');
        }, (idx + 1) * 64)
    });
    new Promise(async () => {
        await delayed(logoSpan.length * 64);
        counterAnim("#counter", 0, 100/*mark*/, 850);
        await delayed(1800);
        logoSpan.forEach((span, idx) => {
            span.classList.remove('active');
            span.classList.add('fade'); // fade time in style.css '.logo.fade'
        });
        await delayed(150);
        intro.classList.add('fade');
        {
            let twitterButton = document.getElementById("end-screen-share");
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) { twitterButton.innerHTML = this.responseText; }
                }
                twttr.widgets.load(twitterButton);
                FB.XFBML.parse();
            }
            xhttp.open("GET", twitterButton.getAttribute("url"), true);
            xhttp.send();
        }

    });
}

const counterAnim = (qSelector, start = 0, end, duration = 1000) => {
    const target = document.querySelector(qSelector);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        {
            var showVar = Math.min(progress, 0.5) * (end - start) * 1.2;
            for (let i = 0.5; i <= 1; i += 0.1) {
                if (progress >= i) showVar += (progress - i) / (1 - i) * (end - start - showVar);
            }
        }
        target.innerText = Math.floor(showVar + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

const initScorePage = async () => {
    const scoreDiv = SCORE_BOX.getElementsByClassName('center')[0];
    while (scoreDiv.firstChild) {
        scoreDiv.removeChild(scoreDiv.lastChild);
    }

    let request = new Request("./scoreboard.json", { method: 'GET'});
    let response = await fetch(request);
    let resObj = JSON.parse(await response.text());
    let topNArray = resObj.scoreboard;
    console.log(topNArray);
    //return;
    let top3 = document.createElement('div');
    top3.classList.add('top3');
    let list = document.createElement('div');
    list.classList.add('list');

    for (let i = 0; i < 10; ++i) {
        let item = document.createElement('div');
        item.classList.add('item');

        if (i < 3) {
            top3.appendChild(item);
            if (i + 1 === 1) { item.classList.add('one'); }
            if (i + 1 === 2) { item.classList.add('two'); }
            if (i + 1 === 3) { item.classList.add('three'); }
        }
        else {
            list.appendChild(item);
        }

        {
            let pos = document.createElement('div');
            pos.classList.add('pos');
            pos.innerHTML = i + 1;
            item.appendChild(pos);
        }
        {
            let dataName = (i < topNArray.length) ?
                decodeURIComponent(atob(topNArray[i].name)) : 'No Data';

            let name = document.createElement('div');
            name.classList.add('name');
            name.innerHTML = dataName;
            item.appendChild(name);
        }
        {
            let dataScore = (i < topNArray.length) ? topNArray[i].score : 'No Data ';

            let score = document.createElement('div');
            score.classList.add('score');
            score.innerHTML = dataScore;
            item.appendChild(score);
        }
    }
    scoreDiv.appendChild(top3);
    scoreDiv.appendChild(list);

}

const initGamePage = () => {
    new Promise(async () => {
        await initPage();
        startPage(1);
    });
}

var addMistake = () => {
    if (mistakeIdx < MISTAKES.length) {
        let e = MISTAKES.item(mistakeIdx++);
        e.classList.add('mistake');
    }
    if (mistakeIdx === MISTAKES.length) {
        onTimesUp();
    }
}
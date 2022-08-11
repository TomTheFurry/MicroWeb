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
        startEndPage();
    }
}

const GAME_BOX = document.getElementById('game-box');
const END_BOX = document.getElementById('end-box');

const startGamePage = () => {
    showPage(GAME_BOX);
    setTimeout(() => {
        let intro = GAME_BOX.querySelector('.intro');
        let logo = GAME_BOX.querySelector('.logo-header');
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
    })
}

const startEndPage = () => {
    showPage(END_BOX);
    setTimeout(() => {
        let intro = END_BOX.querySelector('.intro');
        let logo = END_BOX.querySelector('.logo-header');
        let logoSpan = END_BOX.querySelectorAll('.logo');

        logoSpan.forEach((span, idx) => {
            setTimeout(() => {
                span.classList.add('active');
            }, (idx + 1) * 75)
        });
        new Promise(async () => {
            await delayed(logoSpan.length * 75);
            counterAnim("#counter", 0, 700/*mark*/, 850);
            await delayed(1800);
            logoSpan.forEach((span, idx) => {
                span.classList.remove('active');
                span.classList.add('fade'); // fade time in style.css '.logo.fade'
            });
            await delayed(150);
            intro.classList.add('fade');
        });
    })
}



const counterAnim = (qSelector, start = 0, end, duration = 1000) => {
    const target = document.querySelector(qSelector);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        {
            var showVar = Math.max(progress, 0.8) * (end - start) * 1.2;
            if (progress > 0.8) showVar += (progress - 0.8) / (duration * 0.2)
        }
        target.innerText = Math.floor(showVar + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};


// for test
const testJSON = () => {
    let regex = /\s/;

    let textsData = [
        {
            "index": 0,
            "texts": [
                "LVL - "
            ],
            "colors": [
                "#008",
                "#C00",
                "#0FA",
                "#A0F"
            ]
        },
        {
            "index": 1,
            "texts": [
                "Mark : "
            ],
            "colors": [
                "#630",
                "#F50",
                "#052",
                "#F08",
                "#880"
            ]
        },
        {
            "index": 2,
            "texts": [
                "HOW TO PLAY"
            ],
            "colors": [
                "#630",
                "#FFE",
                "#880",
                "#0BF",
                "#008",
                "#A0F",
                "#CC0",
                "#F08",
                "#FBE"
            ]
        }
    ]

    let colorTexts = document.getElementsByClassName('colorful-text');

    for (let i = 0; i < colorTexts.length; ++i) {
        let e = colorTexts.item(i);
        let index = parseInt(e.getAttribute('colorful-index'), 10);
        e.removeAttribute('colorful-index');
        
        let textData = textsData.find(e => e.index === index);
        if (!textsData || typeof textData === "undefined") {
            continue;
        }

        let colors = textData.colors;
        textData.texts.forEach((text) => {
            let newLine = document.createElement('span');
            newLine.classList.add('line');

            let colorIdx = 0;
            for (let j = 0; j < text.length; ++j) {
                let c = text.charAt(j);
                if (!c) { continue; }
                let newText = document.createElement('span');
                newText.innerHTML = c;
                if (!regex.test(c)) {
                    newText.style = `--color:${(colors.length === 0) ? '#000' : colors[colorIdx++]}`;
                    newText.classList.add('text');
                }
                if (colorIdx >= colors.length) colorIdx = 0;
                newLine.appendChild(newText);
            }

            e.appendChild(newLine);
        });
    }
}
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

const readJson = async (path) => {
    let requestJson = new Request(path, { method: 'GET' });
    let response = await fetch(requestJson);
    if (response.status === 200) { return await response.json(); }
    else { return null; }
}

const GAME_BOX = document.getElementById('game-box');
const END_BOX = document.getElementById('end-box');

const startGamePage = async () => {
// pass data to server
{
    let entry = {
        score: 40,
        duration: 10,
        name: btoa(encodeURIComponent('分配')),
        level: 1
    }
    let jsonStr = JSON.stringify({postType: "time", entry: entry});
    let request = new Request("", { method: 'POST', body: jsonStr});
    let response = await fetch(request);
    let resObj = JSON.parse(await response.text());
    let topNArray = resObj.scoreboard;
    
    console.log(topNArray);
    topNArray.forEach((e) => {
        console.log(e);
        console.log(decodeURIComponent(atob(e.name)))
    })

}


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

const startEndPage = async () => {
    

    // show page
    showPage(END_BOX);

    let intro = END_BOX.querySelector('.intro');
    // let logo = END_BOX.querySelector('.logo-header');
    let logoSpan = END_BOX.querySelectorAll('.logo');

    logoSpan.forEach((span, idx) => {
        setTimeout(() => {
            span.classList.add('active');
        }, (idx + 1) * 64)
    });
    new Promise(async () => {
        await delayed(logoSpan.length * 64);
        counterAnim("#counter", 0, 700/*mark*/, 850);
        await delayed(1800);
        logoSpan.forEach((span, idx) => {
            span.classList.remove('active');
            span.classList.add('fade'); // fade time in style.css '.logo.fade'
        });
        await delayed(150);
        intro.classList.add('fade');
    });
}


const counterAnim = (qSelector, start = 0, end, duration = 1000) => {
    const target = document.querySelector(qSelector);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        {
            var showVar = Math.min(progress, 0.8) * (end - start) * 1.2;
            for (let i = 0.5; i < 1; i += 0.1) {
                if (progress >= i) showVar += (progress - i) / 0.2 * (end - start - showVar);
            }
        }
        target.innerText = Math.floor(showVar + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

// const counterAnim = (qSelector, start = 0, end, duration = 1000) => {
//     const target = document.querySelector(qSelector);
//     let startTimestamp = null;
//     const step = (timestamp) => {
//         if (!startTimestamp) startTimestamp = timestamp;
//         const progress = Math.min((timestamp - startTimestamp) / duration, 1);
//         target.innerText = Math.floor(progress * (end - start) + start);
//         if (progress < 1) {
//             window.requestAnimationFrame(step);
//         }
//     };
//     window.requestAnimationFrame(step);
// };

const assignColorfulText = async () => {
    let regex = /\s/;

    // colourfulText 'data/colourful-text.json'
    await readJson('data/colourful-text.json').then((colourfulText) => {
        let colorTexts = document.getElementsByClassName('colorful-texts');

        for (let i = 0; i < colorTexts.length && colourfulText !== null; ++i) {
            let e = colorTexts.item(i);
            let id = e.getAttribute('colorful-id');
            e.removeAttribute('colorful-id');

            let textData = colourfulText.find(e => e.id === id);
            if (!colourfulText || typeof textData === "undefined") {
                continue;
            }

            let colors = textData.colors;
            let colorIdx = 0;
            textData.texts.forEach((text, idx) => {
                if (idx !== 0) {
                    let newBr = document.createElement('br');
                    e.appendChild(newBr);
                }

                let newLine = document.createElement('span');
                newLine.classList.add('line');

                for (let j = 0; j < text.length; ++j) {
                    let c = text.charAt(j);
                    let newText = document.createElement('span');
                    
                    if (!regex.test(c)) {
                        newText.innerHTML = c;
                        let color = '#000';
                        if (colors.length >= 0) {
                            color = '';
                            if (colors[colorIdx].charAt(0) !== '#') { color += '#'; }
                            color += colors[colorIdx++];
                        }
                        newText.style.setProperty('--color', color);
                        newText.classList.add('colorful-text');
                    }
                    else {
                        newText.innerHTML = '&nbsp';
                    }

                    if (e.classList.contains('logo-parent')) { newText.classList.add('logo'); }


                    if (colorIdx >= colors.length) colorIdx = 0;
                    newLine.appendChild(newText);
                }

                e.appendChild(newLine);
            });
        }
    });
}
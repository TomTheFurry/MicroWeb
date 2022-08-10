var hideAllPage = () => {
    const MAIN_BOX = document.getElementsByClassName('main-box');
    for (let i = 0; i < MAIN_BOX.length; ++i) {
        let e = MAIN_BOX.item(i);
        e.classList.add('disable');
    }
}

var showPage = (e) => {
    hideAllPage();
    e.classList.remove('disable');
}

const GAME_BOX = document.getElementById('game-box');

// window.addEventListener('DOMContentLoaded', startGamePage);  
var startGamePage = () => {
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
        new Promise(() => __awaiter(this, void 0, void 0, function* () {
            yield delayed(logoSpan.length * 50 + 920);
            logoSpan.forEach((span, idx) => {
                span.classList.remove('active');
                span.classList.add('fade'); // fade time in style.css '.logo.fade'
            });
            yield delayed(150);
            intro.classList.add('fade');
            initGame();
        }));
        /* setTimeout(() => {
            logoSpan.forEach((span, idx) => {
                span.classList.remove('active');
                span.classList.add('fade'); // fade time in style.css '.logo.fade'
            })
        }, logoSpan.length * 50 + 920);
        setTimeout(() => {
            //intro.style.top = '-100vh';
            intro.classList.add('fade');  // fade time in style.css '.intro.fade'
            initGame();
        }, logoSpan.length * 50 + 920); */
    })
}

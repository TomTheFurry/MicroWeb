const GAME_BOX = document.getElementById('game-box');

// window.addEventListener('DOMContentLoaded', gameBoxIntroStart);  
var gameBoxIntroStart = () => {
    setTimeout(() => {
        let intro = GAME_BOX.querySelector('.intro');
        let logo = GAME_BOX.querySelector('.logo-header');
        let logoSpan = GAME_BOX.querySelectorAll('.logo');

        logoSpan.forEach((span, idx) => {
            setTimeout(() => {
                span.classList.add('active');
            }, (idx + 1) * 50)
        });
        setTimeout(() => {
            logoSpan.forEach((span, idx) => {
                span.classList.remove('active');
                span.classList.add('fade'); // fade time in style.css '.logo.fade'
            })
        }, logoSpan.length * 50 + 920);
        setTimeout(() => {
            //intro.style.top = '-100vh';
            intro.classList.add('fade');  // fade time in style.css '.intro.fade'
            initGame();
        }, logoSpan.length * 50 + 920);
    })
}

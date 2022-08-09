const GAME_BOX = document.getElementById('game-box');

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        let intro = document.querySelector('.intro');
        let logo = document.querySelector('.logo-header');
        let logoSpan = document.querySelectorAll('.logo');

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
})

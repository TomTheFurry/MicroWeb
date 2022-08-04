let intro = document.querySelector('.intro');
let logo = document.querySelector('.logo-header');
let logoSpan = document.querySelectorAll('.logo');

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        logoSpan.forEach((span, idx) => {
            setTimeout(() => {
                span.classList.add('active');
            }, (idx + 1) * 50)
        });
        setTimeout(() => {
            logoSpan.forEach((span, idx) => {
                span.classList.remove('active');
                span.classList.add('fade');
            })
        }, logoSpan.length * 50 + 920);
        setTimeout(() => {
            //intro.style.top = '-100vh';
            intro.classList.add('fade');
        }, logoSpan.length * 50 + 920 + 300);
        setTimeout(() => {
            initGame();
        }, logoSpan.length * 50 + 920 + 500);
    })
})

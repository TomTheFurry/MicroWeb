let intro = document.querySelector('.intro');
let logo = document.querySelector('.logo-header');
let logoSpan = document.querySelectorAll('.logo');

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        logoSpan.forEach((span, idx) => {
            setTimeout(() => {
                span.classList.add('active');
            }, (idx + 1) * 150)
        });
        setTimeout(() => {
            logoSpan.forEach((span, idx) => {
                span.classList.remove('active');
                span.classList.add('fade');
            })
        }, 2000);
        setTimeout(() => {
            //intro.style.top = '-100vh';
            intro.classList.add('fade');
        }, 2300);
        setTimeout(() => {
            startTimer();
        }, 2600);
    })
})

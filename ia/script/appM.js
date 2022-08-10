const END_BOX = document.getElementById('end-box');

// window.addEventListener('DOMContentLoaded', startEndPage);
var startEndPage = () => {
	showPage(END_BOX);
	setTimeout(() => {
		let intro = END_BOX.querySelector('.intro');
		let logo = END_BOX.querySelector('.logo-header');
		let logoSpan = END_BOX.querySelectorAll('.logo');

		logoSpan.forEach((span, idx) => {
			setTimeout(() => {
				span.classList.add('active');
			}, (idx + 1) * 150)
		});
		new Promise(() => __awaiter(this, void 0, void 0, function* () {
            yield delayed(logoSpan.length * 50 + 920);
            counterAnim("#counter", 0, 700/*mark*/, 1300);
			yield delayed(1800);
			logoSpan.forEach((span, idx) => {
                span.classList.remove('active');
                span.classList.add('fade'); // fade time in style.css '.logo.fade'
            });
			yield delayed(150);
			intro.classList.add('fade');
        }));
		/* setTimeout(() => {
			logoSpan.forEach((span, idx) => {
				setTimeout(() => {
					span.classList.remove('active');
					span.classList.add('fade');
				}, (idx + 1) * 50)
			})
		}, 4000);
		setTimeout(() => {
			// intro.style.top = '-100vh';
			intro.classList.add('fade');  // fade time in style.css '.intro.fade'
		}, 4500) */
	})
}
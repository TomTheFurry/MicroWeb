const END_BOX = document.getElementById('end-box');


window.addEventListener('DOMContentLoaded', ()=>{
	setTimeout(()=>{
		let intro = END_BOX.querySelector('.intro');
		let logo = END_BOX.querySelector('.logo-header');
		let logoSpan = END_BOX.querySelectorAll('.logo');
		
		logoSpan.forEach((span , idx)=>{
		setTimeout(()=>{
			span.classList.add('active');
			}, (idx +1) * 150)
		});
		setTimeout(()=>{
			logoSpan.forEach((span, idx)=>{
				setTimeout(()=>{
					span.classList.remove('active');
					span.classList.add('fade');
				}, (idx +1) * 50)
			})
		},4000);
		setTimeout(()=>{
			intro.style.top = '-100vh';
		},4500)
	})
})
var colorfulTextParent = [];

const isUserIsDarkMode = () => { return window.matchMedia("(prefers-color-scheme: dark)").matches; }

const isDarkMode = () => { return document.documentElement.classList.contains('dark-mode'); }

const darkMode = () => {
    let rootElement = document.documentElement;
    rootElement.classList.toggle('dark-mode');
}

const readJson = async (path) => {
    let requestJson = new Request(path, { method: 'GET' });
    let response = await fetch(requestJson);
    if (response.status === 200) { return await response.json(); }
    else { return null; }
}

const assignLinkOfButton = () => {
    const buttons = document.getElementsByClassName('button');

    const redirectWebsite = (url) => {
        window.location.href = url;
    }

    for (let i = 0; i < buttons.length; ++i) {
        let e = buttons.item(i);
        if (!e.hasAttribute('redirect-url')) { continue; }

        let url = e.getAttribute('redirect-url');

        e.addEventListener("touchend", () => {redirectWebsite(url)});
		e.addEventListener("mouseup", () => {redirectWebsite(url)});
    }
}

const assignColorfulText = async () => {
    const regex = /\s/;
    let colorTexts = document.getElementsByClassName('colorful-texts');
    if (colorTexts.length === 0) { return; }

    // colourfulText 'data/colourful-text.json'
    await readJson('data/colourful-text.json').then((colourfulText) => {
        for (let i = 0; i < colorTexts.length && colourfulText !== null; ++i) {
            let e = colorTexts.item(i);
            // remove all child with class line
            {
                let children = e.getElementsByClassName('line');
                for (let i = 0; i < children.length; ++i)
                    e.removeChild(children.item(i));
            }
            
            let id = e.getAttribute('colorful-id');
            e.removeAttribute('colorful-id');

            colorfulTextParent.push(e);
            e['id'] = id;

            let textData = colourfulText.find(e => e.id === id);
            if (!colourfulText || typeof textData === "undefined") { continue; }

            let colors = textData.colors;
            let darkColors = textData.darkColors;
            let colorIdx = 0;
            let dColorIdn = 0;
            textData.texts.forEach((text) => {
                let newLine = document.createElement('span');
                newLine.classList.add('line');

                for (let j = 0; j < text.length; ++j) {
                    let c = text.charAt(j);
                    let newText = document.createElement('span');
                    
                    if (!regex.test(c)) {
                        newText.innerHTML = c;
                        {
                            // normal color
                            let color = '#111';
                            if (colors.length > 0) {
                                color = '';
                                if (colors[colorIdx].charAt(0) !== '#') { color += '#'; }
                                color += colors[colorIdx++];
                            }
                            newText.style.setProperty('--color', color);
                        }
                        {
                            // dark color
                            let dColor = '#fff';
                            if (darkColors.length > 0) {
                                dColor = '';
                                if (darkColors[dColorIdn].charAt(0) !== '#') { dColor += '#'; }
                                dColor += darkColors[dColorIdn++];
                            }
                            newText.style.setProperty('--dark-color', dColor);
                        }
                        newText.classList.add('colorful-text');
                    }
                    else {
                        newText.innerHTML = '&nbsp';
                    }

                    if (e.classList.contains('logo-parent')) { newText.classList.add('logo'); }


                    if (colorIdx >= colors.length) colorIdx = 0;
                    if (dColorIdn >= darkColors.length) dColorIdn = 0;
                    newLine.appendChild(newText);
                }

                e.appendChild(newLine);
            });
        }
    });
}

const initPage = async () => {
	if (isUserIsDarkMode()) { darkMode(); }
	await assignColorfulText();
	includeHTML();
	assignLinkOfButton();
}
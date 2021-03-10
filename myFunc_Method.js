// ==UserScript==
// @name         myFunc Method
// @version      0.1.3
// @description  Funciones personalizadas por mi.
// @author       Freitez93
// ==/UserScript==

let bypassed = false,
	navigated = false,
	isGoodLink_allowSelf = false,
	referer = window.location.href,
	hostName = window.location.hostname;

const URL = window.URL;

const parseTarget = target => target instanceof HTMLAnchorElement ? target.href : target;

const unsafelyAssignWithReferer = (target, referer) => {
	//The background script will intercept this request and handle it.
	location.href='https://universal-bypass.org/navigate?target='+encodeURIComponent(target)+'&referer='+encodeURIComponent(referer)
};

const unsafelyAssign = target => {
	navigated = true
	window.onbeforeunload = null
	location.assign(target)
};

const safelyAssign = target => {
	target = parseTarget(target)
	if (navigated || !isGoodLink(target)) return false;

	bypassed = true
	let url = new URL(target)
	if (!url || !url.hash) target += location.hash;

	unsafelyAssign(target)
	return true
};

// Verifica que sea una direccion correcta.
const isGoodLink = link => {
	if (typeof link != 'string' || (link.split('#')[0] == referer.split('#')[0] && !isGoodLink_allowSelf) || link.substr(0, 6) == 'about:' || link.substr(0, 11) == 'javascript:') {
		return false
	} try {
		new URL(link)
	} catch (e) {
		return false
	}
	return true
};

// Verifica si un elemento está disponible a través de document.querySelector:
const ifElement = (element, func, exfunc) => {
	let e = document.querySelector(element)
	if (e){
		func(e)
	} else if (exfunc) exfunc();
};

// Espera hasta que un elemento esté disponible a través de un selector de consultas:
const awaitElement = (element, func) => {
	let t = setInterval(() => {
		let e = document.querySelector(element)
		if (e) {
			func(e);
			clearInterval(t);
		}
	}, 600)
	setInterval(() => clearInterval(t), 60000)
};

// Se activa si la expresión regular coincide con cualquier parte de la URL
const hrefBypass = (regex, func) => {
	if (bypassed) return;
	if (typeof f != 'function') alert('AdsBypasser: Bypass for ' + domain + ' is not a function');

	let res = regex.exec(window.location.href)
	if (res) {
		window.document.title += ' - AdsBypasser';
		bypassed = true;
		func(res)
	}
};

// Se activa si la expresión regular coincide con cualquier parte del nombre de host.
const domainBypass = (domain, f) => ensureDomLoaded(() => {
	if (bypassed) return;
	if (typeof f != 'function') alert('AdsBypasser: Bypass for ' + domain + ' is not a function');

	if (typeof domain == 'string') {
		if (hostName == domain || hostName.substr(hostName.length - (domain.length + 1)) == '.' + domain) {
			window.document.title += ' - AdsBypasser';
			bypassed = true
			f()
		}
	} else if ('test' in domain) {
		if (domain.test(hostName)) {
			window.document.title += ' - AdsBypasser';
			bypassed = true
			f()
		}
	} else {
		console.error('[AdsBypasser] Invalid domain:', domain)
	}
});

// Se activa tan pronto como el DOM está listo
const ensureDomLoaded = (f, if_not_bypassed) => {
	if (if_not_bypassed && bypassed) return;
	if (['interactive', 'complete'].indexOf(document.readyState) > -1) {
		f()
	} else {
		let triggered = false
		document.addEventListener('DOMContentLoaded', () => {
			if (!triggered) {
				triggered = true
				setTimeout(f, 1)
			}
		})
	}
};

// Obtener un numero random entre (min, max)
const getRandom = (min, max) => Math.floor(Math.random() * (max - min)) + min;

// Obtiene el Valor Xpath
const getElementByXpath = (path) => document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

// * async await sleep()
function sleep(ms = 100) {
	return new Promise(function(resolve, reject) {
		setTimeout(() => resolve(), ms)
	})
};

// async await focusMethod()
function focusMethod(element, ms){
	return new Promise(function(resolve, reject) => {
		let thisElement = document.querySelector(element);
		if (thisElement){
			let adjustment = Math.max(0, $(window).height() - $(element).outerHeight(true) );
			let distance = $(element).offset().top - adjustment;
			let smooth = ms || (distance * 0.8);

			thisElement.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
			setTimeout(resolve, smooth)
		} else {
			reject('[Error] Elemento no encontrado usando focusMethod.');
		}
	})
}

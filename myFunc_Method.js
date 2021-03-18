// ==UserScript==
// @name            myFunc_Method
// @version         0.1.3
// @description     Funciones personalizadas por mi.
// @author          Freitez93
// #github          https://raw.githubusercontent.com/Freitez93/my_Biblioteca/main/myFunc_Method.js
// ==/UserLibrary==
// ==/UserScript==


'use strict';
var bypassed = false,
	navigated = false,
	isGoodLink_allowSelf = false,
	referer = window.location.href,
	hostName = window.location.hostname.substr(0,4) == "www." ? window.location.hostname.substr(4) : window.location.hostname;

const URL = window.URL,
parseTarget = target => target instanceof HTMLAnchorElement ? target.href : target,

unsafelyAssignWithReferer = (target, referer) => {
	//The background script will intercept this request and handle it.
	location.href = 'https://universal-bypass.org/navigate?target=' + encodeURIComponent(target) + '&referer=' + encodeURIComponent(referer)
},

unsafelyAssign = target => {
	navigated = true
	window.onbeforeunload = null
	location.assign(target)
},

safelyAssign = target => {
	target = parseTarget(target)
	if (navigated || !isGoodLink(target)) return false;

	bypassed = true
	let url = new URL(target)
	if (!url || !url.hash) target += location.hash;

	unsafelyAssign(target)
	return true
},

// Verifica que sea una direccion correcta.
isGoodLink = link => {
	if (typeof link != 'string' || (link.split('#')[0] == referer.split('#')[0] && !isGoodLink_allowSelf) || link.substr(0, 6) == 'about:' || link.substr(0, 11) == 'javascript:') {
		return false
	} try {
		new URL(link)
	} catch (e) {
		return false
	}
	return true
},

// Verifica si un elemento está disponible a través de document.querySelector:
ifElement = (element, callback, exfunc) => {
	let selector = document.querySelector(element)
	if (selector) {
		callback(selector)
	} else if (exfunc) {
		exfunc();
	}
},

// Espera hasta que un elemento esté disponible a través de un selector de consultas:
awaitElement = (element, callback, interval = 100) => {
	let retry = setInterval(()=>{
		let selector = document.querySelector(element)

		interval--
		if (selector) {
			callback(selector)
			clearInterval(retry)
		} else if (interval == 0) {
			clearInterval(retry)
		}
	}, 300)
},

// Se activa si la expresión regular coincide con cualquier parte de la URL
hrefBypass = (regex, callback) => {
	if (bypassed) return;
	if (typeof callback != 'function') alert('hrefBypass: Bypass for ' + hostName + ' is not a function');

	let res = regex.exec(window.location.href)
	if (res) {
		window.document.title += ' - AdsBypasser';
		bypassed = true;
		callback(res)
	}
},

// Se activa si la expresión regular coincide con cualquier parte del nombre de host.
domainBypass = (domain, callback) => ensureDomLoaded(() => {
	if (bypassed) return;
	if (typeof callback != 'function') alert('domainBypass: Bypass for ' + domain + ' is not a function');

	if (typeof domain == 'string') {
		if (hostName == domain || hostName.substr(hostName.length - (domain.length + 1)) == '.' + domain) {
			window.document.title += ' - AdsBypasser';
			bypassed = true
			callback()
		}
	} else if ('test' in domain) {
		if (domain.test(hostName)) {
			window.document.title += ' - AdsBypasser';
			bypassed = true
			callback()
		}
	} else {
		console.error('[AdsBypasser] Invalid domain:', domain)
	}
}),

// Se activa tan pronto como el DOM está listo
ensureDomLoaded = (callback, if_not_bypassed) => {
	if (if_not_bypassed && bypassed) return;
	if (['interactive', 'complete'].indexOf(document.readyState) > -1) {
		callback()
	} else {
		let triggered = false
		document.addEventListener('DOMContentLoaded', () => {
			if (!triggered) {
				triggered = true
				setTimeout(callback, 100)
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
		setTimeout(resolve, ms)
	})
};

// async await smoothScroll()
async function smoothScroll(element, settings = false, ms) {
	return new Promise(async(resolve, reject) => {
		let thisElement = typeof element == 'object' ? element : document.querySelector(element);

		if (thisElement) {
			if (settings) {
				if (settings.focusPage) window.focus();
				await sleep(ms || 1500);
			}
			let elementStats = thisElement.getBoundingClientRect()
			let adjustment = Math.max(0, (window.outerHeight/2) - elementStats.height);
			let distance = elementStats.top - adjustment

			thisElement.scrollIntoView({
				block: settings.block || 'center',
				inline: settings.inline || 'nearest',
				behavior: settings.behavior || 'smooth'
			});
			sleep(ms || distance * 0.8).then(function() { resolve(thisElement) })
		} else {
			reject('[Error] Elemento no encontrado usando smoothScroll.');
		}
	})
};

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
	hostName = window.location.hostname.substr(0,4) == "www." ? window.location.hostname.substr(4) : window.location.hostname,
	URL = window.URL;

const myFunc = {
	parseTarget : target => {
		return target instanceof HTMLAnchorElement ? target.href : target
	},
	unsafelyAssignWithReferer : (target, referer) => { // The background script will intercept this request and handle it.
		window.location.href = 'https://universal-bypass.org/navigate?target=' + encodeURIComponent(target) + '&referer=' + encodeURIComponent(referer)
	},
	unsafelyAssign : target => {
		navigated = true
		window.onbeforeunload = null
		window.location.assign(target)
	},
	safelyAssign : target => {
		target = parseTarget(target)
		if (navigated || !isGoodLink(target)) return false;

		bypassed = true
		let url = new URL(target)
		if (!url || !url.hash) target += location.hash;

		unsafelyAssign(target)
		return true
	},
	isGoodLink : link => { // Verifica que sea una direccion correcta.
		if (typeof link != 'string' || (link.split('#')[0] == referer.split('#')[0] && !isGoodLink_allowSelf) || link.substr(0, 6) == 'about:' || link.substr(0, 11) == 'javascript:') {
			return false
		} try {
			new URL(link)
		} catch (e) {
			return false
		}
		return true
	},
	ifElement : (selector, callback, exfunc) => { // Verifica si un elemento está disponible a través de getElement:
		var element = myFunc.getElement(selector)

		if (element){
			callback(element)
		} else if (exfunc){
			exfunc()
		}
	},
	awaitElement : (selector, callback, timeout) => { // Espera hasta que un elemento esté disponible a través de getElement. ex: timeout in sec.
		var repeat = timeout || 30;
		var loop = setInterval(function () {
			var element = myFunc.getElement(selector);
			if (element) {
				callback(element);
				clearInterval(loop);
			}
			repeat = (repeat) ? repeat - 1 : clearInterval(loop);
		}, 1000);
	},
	hrefBypass : (regex, callback) => { // Se activa si la expresión regular coincide con cualquier parte de la URL
		if (bypassed) return;
		if (typeof callback != 'function') alert('hrefBypass: Bypass for ' + hostName + ' is not a function');

		var result = regex.exec(window.location.href)
		if (result) {
			window.document.title += ' - AdsBypasser';
			bypassed = true;
			callback(result)
		}
	},
	domainBypass : (domain, callback) => ensureDomLoaded(() => { // Se activa si la expresión regular coincide con cualquier parte del nombre de host.
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
	ensureDomLoaded : (callback, if_not_bypassed) => { // Se activa tan pronto como el DOM está listo
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
	},
	refresh : _blank => {
		window.location.href = window.location.href;
	},
	reload : _blank => {
		window.location.reload();
	},
	close : target => {
		(target || window).close()
	},
	contains : (string, search) => {
		return string.indexOf(search) != -1;
	},
	openInTab : url => {
		if (typeof GM_openInTab != 'undefined') {
			GM_openInTab(url);
		} else {
			var newWindow = window.open(url, "_blank");
			newWindow.focus();
		}
	},
	deleteValue : name => {
		if (typeof GM_deleteValue !== "undefined" && !name) {
			var vals = GM_listValues();
			for (var i in vals) {
				if (vals.hasOwnProperty(i))
					GM_deleteValue(vals[i]);
			}
		} else if (typeof GM_deleteValue !== "undefined") {
			GM_deleteValue(name);
		}
	},
	setValue : (name, value) => {
		if (typeof GM_setValue !== "undefined") {
			GM_setValue(name, value);
		}
	},
	getValue : name => {
		if (typeof GM_listValues !== "undefined" && !name) {
			var list = {};
			var vals = GM_listValues();
			for (var i in vals) {
				if (vals.hasOwnProperty(i))
					list[vals[i]] = GM_getValue(vals[i]);
			}
			return list;
		} else if (typeof GM_getValue !== "undefined" && typeof GM_getValue(name) !== "undefined") {
			return GM_getValue(name);
		} else {
			return null;
		}
	},
	setCookie : (name, value, time, path) => {
		var expires = new Date();
		expires.setTime(new Date().getTime() + (time || 365 * 24 * 60 * 60 * 1000));
		document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expires.toGMTString() + ";path=" + (path || '/');
	},
	getCookie : name => {
		var value = "; " + document.cookie;
		var parts = value.split("; " + name + "=");
		if (parts.length == 2)
			return parts.pop().split(";").shift();
	},
	getElement : (selector, contextNode) => {
		if (typeof selector === 'string') {
			if (selector.indexOf('/') === 0) { // ex: //img[@class="photo"]
				return document.evaluate(selector, contextNode || document, null, window.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			}
			return (contextNode || document).querySelector(selector);
		} else if (selector instanceof window.HTMLElement) {
			return selector;
		}
	},
	getRandom : (min, max) => { // Obtener un numero random entre (min, max)
		return Math.floor(Math.random() * (max - min)) + min;
	},
	sleep : (ms = 100) => { // * async await sleep()
		return new Promise(function(resolve, reject) {
			setTimeout(resolve, ms)
		})
	},
	smoothScroll: async (selector, settings = false, ms) => { // async await smoothScroll()
		return new Promise(async(resolve, reject) => {
			let element = myFunc.getElement(selector);

			if (element) {
				if (settings) {
					if (settings.focusPage) window.focus();
					await myFunc.sleep(ms || 1500);
				}
				let elementStats = element.getBoundingClientRect()
				let adjustment = Math.max(0, (window.outerHeight/2) - elementStats.height);
				let distance = elementStats.top - adjustment

				element.scrollIntoView({
					block: settings.block || 'center',
					inline: settings.inline || 'nearest',
					behavior: settings.behavior || 'smooth'
				});
				myFunc.sleep(ms || distance * 0.8).then(function() { resolve(element) })
			} else {
				reject('[Error] Elemento no encontrado usando smoothScroll.');
			}
		})
	}
};

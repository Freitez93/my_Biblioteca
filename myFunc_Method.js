// ==UserScript==
// @name            myFunc_Method
// @version         0.1.5
// @description     Funciones personalizadas por mi.
// @author          Freitez93
// #github          https://raw.githubusercontent.com/Freitez93/my_Biblioteca/main/myFunc_Method.js
// ==/UserLibrary==
// ==/UserScript==


'use strict';
if (typeof $ === 'undefined' && typeof jQuery === 'function'){
	window.jQuery = window.$ = jQuery;
}

const myFunc = {
	// ------------------------------------------------------- config Inicial.
	bypassed: false,
	navigated: false,
	isGoodLink_allowSelf: false,
	URL: window.URL,
	href: window.location.href,
	hostName: (window.location.hostname.substr(0, 4) == "www.") ? window.location.hostname.substr(4) : window.location.hostname,
	// debug config.
	debug: false,
	// ------------------------------------------------------- end config.
	reload: function () {
		window.location.reload();
	},
	refresh: function () {
		window.location.href = window.location.href;
	},

	msgDebug: function (string, force) {
		if (force || myFunc.debug) {
			console.log('%c' + string, 'font-weight: bold; color:grey');
		}
	},
	parseTarget: function (target) {
		return target instanceof HTMLAnchorElement ? target.href : target;
	},
	unsafelyAssign: function (target) {
		myFunc.navigated = true;
		window.onbeforeunload = null;
		window.location.assign(target);
	},
	safelyAssign: function (target) {
		target = myFunc.parseTarget(target);
		if (myFunc.navigated || !myFunc.isGoodLink(target)) return false;

		myFunc.bypassed = true;
		let url = new myFunc.URL(target);
		if (!url || !url.hash) target += location.hash;

		myFunc.unsafelyAssign(target);
		return true;
	},

	// Verifica que sea una direccion correcta.
	isGoodLink: function (link) {
		if (typeof link != 'string' || (link.split('#')[0] == myFunc.href.split('#')[0] && !myFunc.isGoodLink_allowSelf) || link.substr(0, 6) == 'about:' || link.substr(0, 11) == 'javascript:') {
			return false;
		}
		try {
			new myFunc.URL(link);
		} catch (e) {
			return false;
		}
		return true;
	},

	// Verifica si un elemento está disponible a través de getElement:
	ifElement: function (selector, callback, exfunc) {
		var element = myFunc.getElement(selector);

		if (element) {
			callback(element);
		} else if (exfunc) {
			exfunc();
		}
	},

	// Espera hasta que un elemento esté disponible a través de getElement. ex: timeout in sec.
	awaitElement: function (selector, callback, timeout) {
		var repeat = timeout || 60;
		var loop = setInterval(function () {
			var element = myFunc.getElement(selector);
			if (element) {
				clearInterval(loop);
				callback(element);
			}
			repeat = (repeat) ? repeat - 1 : clearInterval(loop);
		}, 1000);
	},

	// Se activa si la expresión regular coincide con cualquier parte de la URL
	hrefBypass: function (regex, callback) {
		if (myFunc.bypassed) return;
		if (typeof callback != 'function') alert('hrefBypass: Bypass for ' + myFunc.hostName + ' is not a function');

		var result = regex.exec(window.location.href);
		if (result) {
			window.document.title += ' - AdsBypasser';
			myFunc.bypassed = true;
			callback(result);
		}
	},

	// Se activa si la expresión regular coincide con cualquier parte del nombre de host.
	domainBypass: (domain, callback) => myFunc.ensureDomLoaded(() => {
		if (myFunc.bypassed) return;
		if (typeof callback != 'function') alert('domainBypass: Bypass for ' + domain + ' is not a function');

		if (typeof domain == 'string') {
			if (myFunc.hostName == domain || myFunc.hostName.substr(myFunc.hostName.length - (domain.length + 1)) == '.' + domain) {
				window.document.title += ' - AdsBypasser';
				myFunc.bypassed = true
				callback()
			}
		} else if ('test' in domain) {
			if (domain.test(myFunc.hostName)) {
				window.document.title += ' - AdsBypasser';
				myFunc.bypassed = true
				callback()
			}
		} else {
			console.error('[AdsBypasser] Invalid domain:', domain)
		}
	}),

	// Se activa tan pronto como el DOM está listo
	ensureDomLoaded: function (callback, if_not_bypassed) {
		if (if_not_bypassed && myFunc.bypassed)
			return;
		if (['interactive', 'complete'].indexOf(document.readyState) > -1) {
			callback();
		} else {
			let triggered = false;
			document.addEventListener('DOMContentLoaded', () => {
				if (!triggered) {
					triggered = true;
					setTimeout(callback, 100);
				}
			});
		}
	},
	onReady: function (callback, jNativeForce) {
		if (document.readyState === 'complete') {
			setTimeout(callback, 100); // Programar para que se ejecute de inmediato
		} else {
			var jQueryVer = typeof $ === 'function' ? $.fn.jquery.split(' -')[0] : false;

			if (jQueryVer && jNativeForce !== true) {
				myFunc.msgDebug('[onReady] jQuery v' + jQueryVer, true);
				if (jQueryVer.split('.')[0] === '3') {
					$(window).on('load', callback);
				} else {
					$(window).load(callback);
				}
			} else {
				myFunc.msgDebug('[onReady] Version JsNative', true);
				myFunc.onEvent(window, 'load', callback);
			}
		}
	},
	onEvent: function(element, type, callback, bubbles) {
		if (window.addEventListener) { // For all major browsers, except IE 8 and earlier
			(element || window).addEventListener(type, callback, bubbles || false);
		} else { // For IE 8 and earlier versions
			(element || window).attachEvent('on' + type, callback);
		}
		return arguments;
	},
	openInTab: function (url) {
		if (typeof GM_openInTab != 'undefined') {
			GM_openInTab(url);
		} else {
			var newWindow = window.open(url, "_blank");
			newWindow.focus();
		}
	},
	deleteValue: function (name) {
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
	setValue: function (name, value) {
		if (typeof GM_setValue !== "undefined") {
			GM_setValue(name, value);
		}
	},
	getValue: function (name) {
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
	setCookie: function (name, value, time, path) {
		var expires = new Date();
		expires.setTime(new Date().getTime() + (time || 365 * 24 * 60 * 60 * 1000));
		document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expires.toGMTString() + ";path=" + (path || '/');
	},
	getCookie: function (name) {
		var value = "; " + document.cookie;
		var parts = value.split("; " + name + "=");
		if (parts.length == 2)
			return parts.pop().split(";").shift();
	},
	getElement: function (selector, contextNode) {
		var ctx = contextNode || document;

		if (typeof selector === 'string') {
			if (selector.indexOf('/') === 0) { // ex: //img[@class="photo"]
				return document.evaluate(selector, ctx, null, window.XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			}
			return ctx.querySelector(selector);
		} else if (selector instanceof window.HTMLElement) {
			return selector;
		}
	},

	// Obtener un numero random entre (min, max)
	getRandom: function (min = 0, max = 0) {
		return Math.floor(Math.random() * (max - min)) + min;
	},

	// * async await sleep()
	sleep: function (msDelay = 100) {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, msDelay);
		});
	},

	// async await smoothScroll()
	smoothScroll: function (selector, config, msDelay) {
		return new Promise(function (resolve, reject) {
			var element = myFunc.getElement(selector);
			var settings = config ? config : false;

			if (element) {
				if (settings.focusPage) window.focus();

				var elementStats = element.getBoundingClientRect();
				var adjustment = Math.max(0, (window.outerHeight / 2) - elementStats.height);
				var distance = elementStats.top - adjustment;

				element.scrollIntoView({
					block: settings.block || 'center',
					inline: settings.inline || 'nearest',
					behavior: settings.behavior || 'smooth'
				});
				myFunc.sleep(msDelay || distance * 0.8).then(() => resolve(element));
			} else {
				reject('Elemento no encontrado usando smoothScroll.');
			}
		});
	},
	indexOfArray: function (elem, list) {
		var len = list.length;
		for (var i = 0; i < len; i++) {
			if (list[i] === elem) {
				return i;
			}
		}
		return -1;
	},
};

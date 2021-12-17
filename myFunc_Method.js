// ==UserScript==
// @name            myFunc_Method
// @version         0.1.5
// @description     Funciones personalizadas por mi.
// @author          Freitez93
// #github          https://raw.githubusercontent.com/Freitez93/my_Biblioteca/main/myFunc_Method.js
// ==/UserLibrary==
// ==/UserScript==


'use strict';
const myFunc = {
	// ------------------------------------------------------- config Inicial.
	debug: false,
	jQueryVer: (typeof $ === 'function') ? $.fn.jquery : (typeof jQuery === 'function') ? jQuery.fn.jquery : false,
	hostName: (window.location.hostname.substr(0, 4) == "www.") ? window.location.hostname.substr(4) : window.location.hostname,
	// ------------------------------------------------------- end config.
	reload: function() {
		window.location.reload();
	},
	refresh: function() {
		window.location.href = window.location.href;
	},

	msgDebug: function(string, force) {
		if (force || myFunc.debug) {
			console.log('%c' + string, 'font-weight: bold; color:grey');
		}
	},

	// Obtener un numero random entre (min, max)
	getRandom: function(min = 0, max = 0) {
		return Math.floor(Math.random() * (max - min)) + min;
	},

	// * async await sleep()
	sleep: function(msDelay = 100) {
		return new Promise(function(resolve, reject) {
			setTimeout(resolve, msDelay);
		});
	},

	getElement: function(selector, contextNode) {
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

	// Verifica si un elemento está disponible a través de getElement:
	ifElement: function(selector, callback, exfunc) {
		var element = myFunc.getElement(selector);

		if (element) {
			callback(element);
		} else if (exfunc) {
			exfunc();
		}
	},

	// Espera hasta que un elemento esté disponible a través de getElement. ex: timeout in sec.
	awaitElement: function(selector, callback, timeout) {
		var repeat = timeout || 60;
		var loop = setInterval(function() {
			var element = myFunc.getElement(selector);
			if (element) {
				clearInterval(loop);
				callback(element);
			}
			repeat = (repeat) ? repeat - 1 : clearInterval(loop);
		}, 1000);
	},

	onReady: function(callback, jNativeForce) {
		if (document.readyState === 'complete') {
			setTimeout(callback, 100); // Programar para que se ejecute de inmediato
		} else {
			var jQueryVer = myFunc.jQueryVer ? myFunc.jQueryVer.split(' -')[0] : false;

			if (!jNativeForce && jQueryVer) {
				console.log('[onReady] jQuery %cv'+jQueryVer, 'font-weight: bold; color:#2ECC71')
				if (jQueryVer.split('.')[0] === '3') {
					$(window).on('load', callback);
				} else {
					$(window).load(callback);
				}
			} else {
				console.log('[onReady] jQuery %cv'+jQueryVer, 'font-weight: bold; color:#2ECC71')
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
	openInTab: function(url) {
		if (typeof GM_openInTab != 'undefined') {
			GM_openInTab(url);
		} else {
			var newWindow = window.open(url, "_blank");
			newWindow.focus();
		}
	},
	deleteValue: function(name) {
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
	setValue: function(name, value) {
		if (typeof GM_setValue !== "undefined") {
			GM_setValue(name, value);
		}
	},
	getValue: function(name) {
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
	setCookie: function(name, value, time, path) {
		var expires = new Date();
		expires.setTime(new Date().getTime() + (time || 365 * 24 * 60 * 60 * 1000));
		document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expires.toGMTString() + ";path=" + (path || '/');
	},
	getCookie: function(name) {
		var value = "; " + document.cookie;
		var parts = value.split("; " + name + "=");
		if (parts.length == 2)
			return parts.pop().split(";").shift();
	},

	indexOfArray: function(elem, list) {
		var len = list.length;
		for (var i = 0; i < len; i++) {
			if (list[i] === elem) {
				return i;
			}
		}
		return -1;
	},
};

/*
	Extiende los objetos de elemento con una función denominada scrollIntoViewPromise.
	options: las opciones normales de scrollIntoView sin ningún cambio.
*/

Element.prototype.scrollIntoViewPromise = function(options) {
	// "this" se refiere al elemento actual (el.scrollIntoViewPromise(options): this = el)
	this.scrollIntoView(options);

	// Creo una variable que se puede leer dentro del objeto devuelto ({ then: f() }) para exponer el elemento actual 
	let parent = this;

	// Devuelvo un objeto con solo una propiedad en el interior llamada then
	// then contiene una función que acepta una función como parámetro que se ejecutará cuando finalice el desplazamiento.
	return {
		then: function(x) {
			// Verificar https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API for more informations  
			const intersectionObserver = new IntersectionObserver((entries) => {
				let [entry] = entries;
				// Cuando termina el desplazamiento (cuando su elemento está dentro de la pantalla)
				if (entry.isIntersecting) {
					// Ejecute la función en el parámetro y deje de observar el elemento html 
					setTimeout(() => {
						x();
						intersectionObserver.unobserve(parent)
					}, 100)
				}
			});
			// Empiezo a observar el elemento donde me desplacé.
			intersectionObserver.observe(parent);
		}
	};
}

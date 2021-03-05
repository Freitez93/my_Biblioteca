let bypassed = false,
	navigated = false,
	isGoodLink_allowSelf = false,
	referer = window.location.href,
	hostName = window.location.hostname;
const URL = window.URL,
	parseTarget = target => target instanceof HTMLAnchorElement ? target.href : target,
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
	isGoodLink = link => {
		if (typeof link != "string" || (link.split("#")[0] == referer.split("#")[0] && !isGoodLink_allowSelf) || link.substr(0, 6) == "about:" || link.substr(0, 11) == "javascript:") {
			return false
		}
		try {
			new URL(link)
		} catch (e) {
			return false
		}
		return true
	},
	awaitElement = (element, f) => {
		let t = setInterval(() => {
			let e = document.querySelector(element)
			if (e) {
				f(e), clearInterval(t)
			}
		}, 600)
		setInterval(() => clearInterval(t), 60000)
	},
	ifElement = (q, f, ef) => ensureDomLoaded(() => {
		let e = document.querySelector(q)
		if (e) f(e);
		else if (ef) ef();
	}),
	hrefBypass = (regex, f) => {
		if (bypassed) return;
		if (typeof f != "function") alert("AdsBypasser: Bypass for " + domain + " is not a function");

		let res = regex.exec(window.location.href)
		if (res) {
			window.document.title += ' - AdsBypasser';
			bypassed = true;
			f(res)
		}
	},
	domainBypass = (domain, f) => ensureDomLoaded(() => {
		if (bypassed) return;
		if (typeof f != "function") alert("AdsBypasser: Bypass for " + domain + " is not a function");

		if (typeof domain == "string") {
			if (hostName == domain || hostName.substr(hostName.length - (domain.length + 1)) == "." + domain) {
				window.document.title += ' - AdsBypasser';
				bypassed = true
				f()
			}
		} else if ("test" in domain) {
			if (domain.test(hostName)) {
				window.document.title += ' - AdsBypasser';
				bypassed = true
				f()
			}
		} else {
			console.error("[AdsBypasser] Invalid domain:", domain)
		}
	}),
	ensureDomLoaded = (f, if_not_bypassed) => {
		if (if_not_bypassed && bypassed) return;
		if (["interactive", "complete"].indexOf(document.readyState) > -1) {
			f()
		} else {
			let triggered = false
			document.addEventListener("DOMContentLoaded", () => {
				if (!triggered) {
					triggered = true
					setTimeout(f, 1)
				}
			})
		}
	};
//------------------------------------------------------------------------------------------------------------------------\\
// https://uniqueten.net || https://ultraten.net
hrefBypass(/uniqueten\.net(.+)link=/, () => {
	safelyAssign('https://ultraten.net/home/sh//' + referer.split('=')[1])
});

// https://freebcc.org
hrefBypass(/freebcc\.org(.+)a\//, () => {
	safelyAssign(referer.replace('a/', ''))
});

// https://freecrypto.cyou
hrefBypass(/freecrypto\.cyou(.+)link=/, () => {
	safelyAssign('https://freecrypto.cyou/' + referer.split('=')[1])
});

// https://ccurl.net
hrefBypass(/ccurl\.net(.+)redirectpage/, () => {
	safelyAssign(referer.replace('redirectpage/', ''))
});

// https://zagl.info
hrefBypass(/zagl\.info/, () => {
	if (referer.indexOf('/verify') < 0) safelyAssign(referer + '/verify');
});

// https://faucet.100count.net
hrefBypass(/(faucet.|)100count\.net/, () => {
	ifElement('#cl1 > a[href]', href => {
		safelyAssign(href)
	}, () => {
		if (referer.indexOf('?verif=') < 0) safelyAssign(referer.replace('faucet.', ''));
	})
});

// https://(movie|anime|tech)\.DutchyCorp.space
hrefBypass(/(movies|anime|tech)\.dutchycorp\.space/, () => {
	awaitElement('#cl1 > center > a[href]', href => {
		safelyAssign(href)
	})
});

// https://shortit.pw/
hrefBypass(/shortit\.pw/, () => {
	ifElement('#btn2[href]', href => {
		window.document.title =+ ' - AdsBypasser'
		safelyAssign(href)
	}, () => {
		awaitElement('#btn2:not([disabled])', button => {
			button.click();
		})
	})
});

// https://fc.lc
domainBypass(/(fc|fcc)\.lc/, () => {
	ifElement('#submitbtn', button => {
		button.click();
	}, () => {
		awaitElement('#invisibleCaptchaShortlink:not([disabled])', button => {
			setTimeout(() => { button.click() }, 1500)
		})
	})
});

// https://adbull.me || https://adshort.co || https://pingit.im
domainBypass(/(deportealdia|techgeek|noticiasesports)\.(live|digital)/, () => {
	ifElement('#surl1', a => {
		awaitElement('#surl1:not([disabled])', button => {
			button.click();
		});
	}, () => {
		ifElement("form", getLink => {
			setTimeout(() => { getLink.submit() }, 1500)
		})
	})
});

// https://www.shortique.com/ || https://www.adz7short.space/ || https://short.croclix.me/
domainBypass(/(shortique|adz7short|croclix)\.(com|space|me)/, () => {
	awaitElement('#continue:not([style^="display"])', button => {
		button.click();
	})
});

// https://bitsfree.xyz ||
domainBypass(/(bitsfree|crypto-faucet|doctor-groups)\.(com|xyz)/, () => {
	ifElement('#mdt', button => {
		button.onclick()
	})
})

// https://fauto.com || https://dogemate.com
domainBypass(/(faupto|dogemate)\.com/, () => {
	ifElement('#bdt', button => {
		setTimeout(() => {
			button.click()
		}, 1000)
	})
});

// https://adsy.pw
domainBypass('adsy.pw', () => {
	ifElement('#links > form > input[type=hidden]:nth-child(1)', getLink => {
		safelyAssign(getLink.form[0].defaultValue)
	}, () => {
		awaitElement('#actionbtn:not([disabled])', button => {
			button.click();
		})
	})
});

// https://www.bitmos.co.in/
domainBypass('bitmos.co.in', () => {
	ifElement("#wpsafe-link > a", button => {
		button.onclick();
		setTimeout(() => window.close(), 500)
	})
})

// https://ouo.io
domainBypass(/ouo\.(press|io)/, () => {
	awaitElement('#btn-main:not([disabled])', button => {
		setTimeout(() => { button.click() }, 1000);
	})
});

// https://cuturl.cc
domainBypass('cuturl.cc', () => {
	ifElement('#countingbtn', href => {
		safelyAssign(href)
	});
});

// https://downfile.site ||
domainBypass(/(downphanmem|downfile)\.(com|site)/, () => {
	awaitElement('#content > div.display > a[href]', href => {
		safelyAssign(href)
	});
});

if (!bypassed) console.log('[AdsBypasser] No iniciara en esta pagina.');

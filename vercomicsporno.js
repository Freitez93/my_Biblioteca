// ==MiruExtension==
// @name         VerComicPorno
// @version      v0.0.1
// @author       Freitez93
// @lang         es
// @license      MIT
// @icon         https://vercomicsporno.com/wp-content/uploads/Iconx64.png
// @package      vercomicsporno
// @type         manga
// @webSite      https://vercomicsporno.com
// ==/MiruExtension==

export default class extends Extension {
	async req(url) {
		const baseUrl = url.replace(await this.getSetting("comic"), "");
		return this.request(baseUrl, {
			headers: {
				"Miru-Url": await this.getSetting("comic"),
			},
		});
	}

	async load() {
		this.registerSetting({
			title: "Page Base Url",
			key: "comic",
			type: "input",
			desc: "this is the url where the comics are fetched from",
			defaultValue: "https://vercomicsporno.com",
		});
	}

	async latest(page) {
		let html = await this.req(`/comics-porno/page/${page}`);

		let items = await this.querySelectorAll(
			html,
			".blog-list-items a.popimg"
		);

		let respItems = await Promise.all(
			items.map(async (item) => ({
				url: await this.getAttributeText(item.content, "a", "href"),
				cover: await this.getAttributeText(
					item.content,
					"img",
					"data-src"
				),
				title: await this.getAttributeText(item.content, "img", "alt"),
			}))
		);

		return respItems;
	}

	async search(kw, page) {
		let searchResponse = await this.req(`/comics-porno/page/${page}?s=${kw}`);
		let items = await this.querySelectorAll(searchResponse, ".blog-list-items a.popimg");

		let respItems = await Promise.all(
			items.map(async (item) => ({
				url: await this.getAttributeText(item.content, "a", "href"),
				cover: await this.getAttributeText(
					item.content,
					"img",
					"data-src"
				),
				title: await this.getAttributeText(item.content, "img", "alt"),
			}))
		);

		return respItems;
	}
	async detail(url) {
		const detailResponse = await this.req(url);
		const autor = await this.querySelector(detailResponse, "span.autor > b").text;
		const date = await this.querySelector(detailResponse, "span.date").text;

		const title = (await this.querySelector(detailResponse, "h1.titl").text).trim();
		const cover = await this.getAttributeText(detailResponse, ".wp-content img", "data-src");
		const desc = `» Publicado por ${autor}el ${date}`;

		return {
			title,
			cover,
			desc,
			episodes: [
				{
					title: "Chapters",
					urls: [
						{
							url: url,
							name: "Leer Comic",
						},
					],
				},
			],
		};
	}

	async watch(url) {
		const watchRes = await this.req(url);
		const imgLista = await this.querySelectorAll(watchRes, ".wp-content img");
		let pages = []

		for (const element of imgLista) {
			pages.push(await this.getAttributeText(element.content,"img", "data-src"))
		}
		return {
			urls: pages,
		};
	}
}

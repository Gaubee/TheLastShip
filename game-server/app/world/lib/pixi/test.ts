declare const require;
declare const global;

// global.window = global;
global.navigator = {
	appCodeName: "Mozilla",
	appName: "Netscape",
	appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36",
	cookieEnabled: true,
	doNotTrack: null,
	hardwareConcurrency: 4,
	language: "zh-CN",
	maxTouchPoints: 0,
	onLine: true,
	platform: "Win32",
	product: "Gecko",
	productSub: "20030107",
	userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36",
	vendor: "Google Inc.",
	vendorSub: "",
};
// const jsdom = require("jsdom").jsdom;
// global.document = jsdom(undefined, {});
global.document = {
	createElement(tagName) {
		var res = {
			tagName: tagName.toUpperCase()
		};
		if (res.tagName === "CANVAS") {
			res["getContext"] = function() {
				return {}
			}
		}
		return res;
	}
}
require("./index");
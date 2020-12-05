let doRedirect = true;
let acceptedList = ["wikipedia.org", "wiktionary.org", "wikibooks.org", "wikiquote.org", "wikiversity.org",
					"wikinews.org", "wikisource.org", "wikidata.org", "mediawiki.org", "wikivoyage.org"];

function inAcceptedList(x) {
	for (var i = 0; i < acceptedList.length; i++) {
		if (x.includes(acceptedList[i])) return true;
	}
	return false;
}

let gottenUrls = [];
for (var i = acceptedList.length - 1; i >= 0; i--) {
	gottenUrls.push(`*://*.${acceptedList[i]}/*`);
}

chrome.browserAction.onClicked.addListener(function() {
	
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => { // use `url` here inside the callback because it's asynchronous!
			let url = tabs[0].url;
			const useLength = 32; // we only need to the .org part..
			if (url.length >= useLength) {
				if (inAcceptedList(url.substring(0, useLength))) {
					doRedirect = !doRedirect;
					chrome.tabs.executeScript(tab.id, {code: 'window.location.reload();'});
				}
			}
		});
	});
});

chrome.webRequest.onBeforeRequest.addListener(
	function(info) {
		if (doRedirect) {
			let newUrl = info.url.replace("http://", "https://");
			if (newUrl.length > 10) {
				if (newUrl.substring(0, 8).includes("https:")) {
					newUrl = newUrl.substring(8); // removes https://, well add it later when we need it.
				}
				let lang = "";
				if (newUrl.substring(0, 3) == "m.w") {
					return {redirectUrl: info.url}; // is already in mobile version.
				}
				else {
					lang = newUrl.substring(0, 3);
					if (lang.split(".").length-1 != 1) {
						lang = "";
						// we're trying to remove www. instead of en. so we need to remove an extra char.
						newUrl = newUrl.substring(1); 
					}
					newUrl = newUrl.substring(3);
					if (newUrl.substring(0, 3) == "m.w") {
						return {redirectUrl: info.url}; // is already in mobile version.
					}
				}
				return {redirectUrl: `https://${lang}m.${newUrl}`};
			}
		}
		else {
				let curl = info.url;
				if (curl.substring(0, 16).includes(".m.")) {
					curl = curl.replace(".m.", ".");
				}
				else if (curl.substring(0, 16).includes("m.")) {
					curl = curl.replace("m.", "www.");
				}
			return {redirectUrl: curl};
		}
	},
	// filters
	{
		urls: gottenUrls
	},
	// extraInfoSpec
	["blocking"]
);

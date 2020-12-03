let doRedirect = true;

chrome.browserAction.onClicked.addListener(function() {

	doRedirect = !doRedirect;
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => { // use `url` here inside the callback because it's asynchronous!
			let url = tabs[0].url;
			const useLength = 26; // the length of a wikipedia url up to the .org part.
			if (url.length >= useLength) {
				if (url.substring(0, useLength).includes("wikipedia.org")) {
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
			newUrl = newUrl.substring(8); // removes https://, well add it later when we need it.
			let lang = "";
			if (newUrl.substring(0, 3) == "m.w") {
				return {redirectUrl: info.url}; // is already in mobile version.
			}
			else {
				lang = newUrl.substring(0, 3);
				newUrl = newUrl.substring(3);
				if (newUrl.substring(0, 3) == "m.w") {
					return {redirectUrl: info.url}; // is already in mobile version.
				}
			}
			return {redirectUrl: `https://${lang}m.${newUrl}`};
		}
	}
    else {
    	return {redirectUrl: info.url.replace(".m.", ".")};
    }
  },
  // filters
  {
    urls: ["*://*.wikipedia.org/*", "*://wikipedia.org/*", "*://*.wikipedia.org/", "*://wikipedia.org/"]
  },
  // extraInfoSpec
  ["blocking"]
);
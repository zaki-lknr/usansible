chrome.omnibox.onInputEntered.addListener(
    function (text, disposition) {
        console.log("text: " + text);
        let url = "https://docs.ansible.com/ansible/latest/search.html?q=" + text;

        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.update(tab.id, { url: url });
        });
    }
)
chrome.omnibox.onInputEntered.addListener(
    function (text, disposition) {
        // console.log("text: " + text);
        let url = "https://docs.ansible.com/ansible/latest/search.html?q=" + text + '#stq=' + text + '&stp=1';

        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, tabs => {
            // console.log("url:: " + url);
            // console.log("tabs: " + tabs[0].id);
            chrome.tabs.update(tabs[0].id, { url: url });
        });
    }
)

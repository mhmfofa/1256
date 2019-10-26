let SearchModule = function (config) {
    let xhr = config && config.xhr ? config.xhr : new XMLHttpRequest();
    let requestHeaders = config && config.requestHeaders ? config && config.requestHeaders : [];
    let apiUrl = config && config.apiUrl ? config.apiUrl : "";
    // to specify minimum number of characters before we start to generate suggestions
    let minCahrs = config && config.minCahrs ? config.minCahrs : 1;
    // to prevent sending fast multiple requests while user type the search query
    let requestDelay = config && config.requestDelay ? config.requestDelay : 600;
    // to specify xhr error function
    let errorCallbackFunc = config && config.errorCallbackFunc ? config.errorCallbackFunc : () => { };
    // to create custom suggestion panel renderer 
    let suggestionPanelRenderFunc = config && config.suggestionPanelRenderFunc ? config.suggestionPanelRenderFunc : () => { };
    let params = config && config.params ? config.params : [];
    //set wrapper element selector
    let containerSelector = config && config.containerSelector ? config.containerSelector : "";
    let searchHistoryList = [];
    let lastSearchQuery;
    let timeout = null;

    function loading(show) {
        show ?
            document.querySelector(containerSelector).classList.add('loading') :
            document.querySelector(containerSelector).classList.remove('loading');
    }

    let search = function (query) {
        // check possible errors
        if (!apiUrl || !query || query.length < minCahrs || query == lastSearchQuery) {
            return;
        } else {
            // abort old requests when a new one is made
            xhr.abort();
            // to prevent to send redendant requests
            lastSearchQuery = query;
            // make query safe from html tags
            query = query.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            loading(true);
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        lastSearchQuery = "";

                        loading(false);
                        if (this.status == 200) {
                            let response = JSON.parse(this.responseText);
                            suggestionPanelRenderFunc(response);
                        }
                        else {
                            errorCallbackFunc(this);
                        }
                    }
                };
                // adding extra params (if exist)
                params.map((p) => {
                    query += `&${p.name}=${p.value}`;
                })
                xhr.open("GET", apiUrl + query);
                // adding request headers params (if exist)
                requestHeaders.map((rh) => {
                    xhr.setRequestHeader(rh.name, rh.value);
                });
                xhr.send();
            }, requestDelay)
        }
    }

    var deleteSearchHistoryByIndex = function (i) {
        searchHistoryList.splice(i, 1);
    };

    var clearSearchHistoryList = function (i) {
        searchHistoryList.splice(i, 1);
    };

    return {
        // public members
        searchHistoryList: searchHistoryList,
        search: search,
        clearSearchHistoryList: clearSearchHistoryList,
        deleteSearchHistoryByIndex: deleteSearchHistoryByIndex,
    }
};

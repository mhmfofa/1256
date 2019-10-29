// configuration for company search fropm public api on clearbit.com
let searchCompaniesConfig = {
  containerSelector: "#searchWapper",
  apiUrl: "https://autocomplete.clearbit.com/v1/companies/suggest?query=",
  suggestionPanelRenderFunc: (res) => {
    renderCompanySuggestions(res)
  }
}
// configuration for place search from public api on here.com
let searchPlacesConfig = {
  containerSelector: "#searchWapper",
  apiUrl: "https://autocomplete.geocoder.api.here.com/6.2/suggest.json?query=",
  params: [ 
    { name: "app_id", value: "8ZcqKVoLTaEzyeJfzFsw" },
    { name: "app_code", value: "0cP4aJYgGQnapumWimlwXA" },
    { name: "beginHighlight", value: encodeURIComponent('<mark>') },
    { name: "endHighlight", value: encodeURIComponent('</mark>') }
  ],
  suggestionPanelRenderFunc: (res) => {
    renderPlaceSuggestions(res)
  }
}
let searchModule = new SearchModule(searchCompaniesConfig);

// Add a keyup event listener to our input element
document.querySelector('.search-wrapper>input').addEventListener("keyup", function (e) {
  if (e.target.value) {
    if (e.target.value != searchModule.lastSearchQuery) {
      // to prevent to send redendant requests
      searchModule.lastSearchQuery = e.target.value;
      searchModule.search(e.target.value)
      document.querySelector('.search-wrapper').classList.add("has-value");
    }
  }
  else {
    searchModule.lastSearchQuery = "";
    clearInput()
  };
});
document.querySelector('.search-wrapper>input').addEventListener("focus", function (e) {
  document.querySelector('.search-wrapper').classList.add("focused");
});
document.querySelector('.search-wrapper>input').addEventListener("blur", function (e) {
  document.querySelector('.search-wrapper').classList.remove("focused");
});

// Add a click event listener to our search type buttons
document.querySelectorAll('.search-type button').forEach((elm) => {
  elm.addEventListener("click", function (e) {
    let type = e.target.dataset.key;
    document.querySelector('.search-wrapper>label').innerText =
    document.querySelector('.search-wrapper>input').placeholder =
    document.querySelector('.search-wrapper>input').title = 'Search for ' + type;
    document.querySelector('.search-type').className = 'search-type ' + type;
    searchModule = type == "companies" ? new SearchModule(searchCompaniesConfig) : new SearchModule(searchPlacesConfig);
    renderSearchHistory();
    searchModule.search(document.querySelector('.search-wrapper>input').value);
  })
});

function clearInput() {
  document.querySelector('.search-wrapper>input').value = "";
  document.querySelector('.search-wrapper').classList.remove("has-value");
  hideSuggestionPanel();
}

function hideSuggestionPanel() {
  document.removeEventListener("click", hideSuggestionPanel);
  document.querySelector('.suggetion-panel').classList.remove("show");
  document.querySelector('.suggetion-panel').innerHTML = "";
}

function addSearchHistory(name) {
  searchModule.searchHistoryList.push({ name: name, time: new Date().toLocaleString() })
  searchModule.lastSearchQuery = "";
  clearInput();
  renderSearchHistory();
}

function removeSearchHistoryItem(i) {
  searchModule.searchHistoryList.splice(i, 1);
  renderSearchHistory();
}

function clearSearchHistory() {
  searchModule.searchHistoryList = [];
  renderSearchHistory();
}

// render functions
function renderCompanySuggestions(res) {
  let innerHtml = "";
  let q = document.querySelector('.search-wrapper>input').value;
  if (!q) hideSuggestionPanel();
  else {
    document.addEventListener("click", function (e) {
      if (e.target.localName != "input" && e.target.localName != "button")
        hideSuggestionPanel()
    });
    if (!res || !res.length) {
      innerHtml = "<div class='no-result'>no result found!</div>";
    }
    else
      res.forEach(item => {
        let highlightedName = item.name.toLowerCase().indexOf(q.toLowerCase()) < 0 ? item.name : `<mark>${q}</mark>${item.name.substr(q.length)}`;
        let highlightedlink = item.domain.toLowerCase().indexOf(q.toLowerCase()) < 0 ? item.domain : `<mark>${q}</mark>${item.domain.substr(q.length)}`;
        innerHtml += 
          `<div class='row-item' onclick='addSearchHistory("${item.name.replace("'", "\\'")}")'>
            <img src="${item.logo}" alt="" />
            <div>
              <strong>${highlightedName}</strong>
              <span>${highlightedlink}</span>
            </div>
          </div>`;
      });
    document.querySelector('.suggetion-panel').classList.add("show");
    document.querySelector('.suggetion-panel').innerHTML = innerHtml;
  }
}

function renderPlaceSuggestions(res) {
  let innerHtml = "";
  let q = document.querySelector('.search-wrapper>input').value;
  if (!q) hideSuggestionPanel();
  else {
    document.addEventListener("click", function (e) {
      if (e.target.localName != "input" && e.target.localName != "button")
        hideSuggestionPanel()
    });
    if (!res || !res.suggestions || !res.suggestions.length) {
      innerHtml = "<div class='no-result'>no result found!</div>";
    }
    else
      res.suggestions.forEach(item => {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = item.label;
        let clearTextLabel = tmp.textContent || tmp.innerText || "";
        innerHtml += 
          `<div class='row-item' onclick="addSearchHistory('${(clearTextLabel.substr(0, 50)).replace("'", "\\'")}')">
            <i class="pin"></i>
            <div>
              <strong>${item.label}</strong>
              <div>
                <span>country code: <b>${item.countryCode}</b></span>
                <span>language: <b>${item.language}</b></span>
              </div>
            </div>
          </div>`;
      });
    document.querySelector('.suggetion-panel').classList.add("show");
    document.querySelector('.suggetion-panel').innerHTML = innerHtml;
  }
}

function renderSearchHistory() {
  let innerHTML = searchModule.searchHistoryList.length ?
    `<div class="row-item title">
        <h2> Search History </h2>
        <a href="javascript:clearSearchHistory()">Clear search hisroty</a>
      </div>
      <div class="scrol-panel">`: "";
  for (let i = searchModule.searchHistoryList.length - 1; i >= 0; i--) {
    innerHTML += 
      `<div class="row-item">
        <span>${searchModule.searchHistoryList[i].name}</span>
        <div>
          <date>${searchModule.searchHistoryList[i].time}</date>
          <button class="delete" title="Remove search history item" onclick="removeSearchHistoryItem(${i})"></button>
        </div>
      </div>`;
  }
  innerHTML += "</div>";
  document.querySelector('.search-history-panel').innerHTML = innerHTML;
}

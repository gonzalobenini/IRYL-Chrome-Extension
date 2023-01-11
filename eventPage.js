// connection with the popup
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
    if (request.operation === 'changeSettings'){
        changeReadingSettings(request.languageToRead,request.speed,request.volume)
    }
    if (request.operation === 'changeLanguage'){
        chrome.contextMenus.update('pronunciate',{'title':localizedPronunciationContextMenu(request.language)})
    }
})

function changeReadingSettings(language,speed,volume){
    settings.languageToRead = language
    settings.speed = Number(speed)
    settings.volume = Number(volume)/10
}

// initialization
function a(){console.log('a')}

var settings = {}
getSavedSettings() // also creates the context menu

function read(msg){
    speechSynthesis.speak(msg);
}

chrome.contextMenus.onClicked.addListener(function(clickData){
    if (settings.languageToRead === 'auto'){
        fetch('http://gon23.pythonanywhere.com/', {
            method: 'POST',
            body: clickData.selectionText,
            mode: 'cors'
          })
          .then(response => response.json())
          .then(data => {
            chrome.tts.speak(clickData.selectionText,{'lang': data.detection, 'rate': settings.speed,'volume':settings.volume,'pitch':0});
          })
    }
    else chrome.tts.speak(clickData.selectionText,{'lang': settings.languageToRead, 'rate': settings.speed,'volume':settings.volume,'pitch':0});
})

// reading from local storage
function getSavedSettings(){
    chrome.storage.local.get('baseLanguage').then(res => {
        settings.baseLanguage = res.baseLanguage === undefined ? 'en' : res.baseLanguage
        var contextMenuItem = {
            "id": "pronunciate",
            "title": localizedPronunciationContextMenu(settings.baseLanguage),
            "contexts": ["selection"]
        };        
        chrome.contextMenus.create(contextMenuItem)
    })
    chrome.storage.local.get('languageToRead').then(res => {settings.languageToRead = res.languageToRead === undefined ? 'auto' : res.languageToRead})
    chrome.storage.local.get('speed').then(res => settings.speed = res.speed === undefined ? 1 : Number(res.speed))
    chrome.storage.local.get('volume', res => settings.volume = res.volume === undefined ? 1 : Number(res.volume)/10)
}

// get localized plain text
function localizedPronunciationContextMenu(appLanguage){
    switch (appLanguage){
        case 'es': return 'pronunciar';
        case 'en': return 'pronounce';
    }
}

// fixes some unsupported languages, this function can get bigger in the future as more languages start beeing aded
function correctMinorErrors(lang){
    if (lang === 'ne') {return 'hi'};
    return lang
}
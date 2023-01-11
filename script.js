function updateAppSettings(){
    // updating reading settigns in the TTS engine
    const languageToRead = document.getElementById("readingLanguageSelector")
    const speed = document.getElementById("radioSpeed").elements["radioInline"]
    const volume = document.getElementById("volumeRange")

    // in the future can be replaced with chrome.storage.onChange
    chrome.runtime.sendMessage({'operation':'changeSettings', 'languageToRead':languageToRead.value, 'speed':speed.value, 'volume':volume.value})

    // savings current settings
    function saveConfig(languageToRead,speed,volume){
        chrome.storage.local.set({'languageToRead':languageToRead})
        chrome.storage.local.set({'speed':speed})
        chrome.storage.local.set({'volume':volume})
    }

    saveConfig(languageToRead.value,speed.value,volume.value)
}

window.addEventListener('DOMContentLoaded', (event) => {
    // main event
    const docBody = document.getElementById('main')
    docBody.addEventListener("change", updateAppSettings)

    // change language event
    const langSelectorElement = document.getElementById('baseLanguage')
    langSelectorElement.addEventListener("change", () => {
        const newValue = langSelectorElement.value
        chrome.runtime.sendMessage({'operation':'changeLanguage','language':newValue})
        chrome.storage.local.set({'baseLanguage':newValue})
        setAppLanguage(newValue)
    })

    // load previous settings
    function loadConfig(baseLanguage,languageToRead,speed,volume){
        const language = baseLanguage===undefined ? 'en' : baseLanguage
        document.getElementById("bl-"+language).setAttribute("selected",'selected')
        setAppLanguage(language)

        if (languageToRead !== undefined){ // this if and the next two could get combined into a 'get utility settings' function that does the same job but it also could be used in eventPage.js
            document.getElementById("read-"+languageToRead).setAttribute("selected",'selected')
        }
        if (speed !== undefined){
            document.getElementById('speed'+speed).setAttribute("checked",'""')
        }
        if (volume !== undefined){
            document.getElementById('volumeRange').value = volume
        }

        updateAppSettings()
    }
    chrome.storage.local.get(['baseLanguage','languageToRead','speed','volume'], data => {
        loadConfig(data.baseLanguage, data.languageToRead, data.speed, data.volume)
    })
});

function setAppLanguage(language){ // pt means 'plain text'
    function returnLanguageData(selectedLanguage){
        if (selectedLanguage === 'es'){
            return {
                "pt-selectYourLang": "Selecciona tu idoma",
                "pt-toReadLang": "Selecciona el lenguaje a leer",
                "pt-readingSpeed": "Velocidad de lectura",
                "pt-volume": "Volumen"
            }
        }
        if (selectedLanguage === 'en'){
            return {
                "pt-selectYourLang": "Select your language",
                "pt-toReadLang": "Select the language to be read",
                "pt-readingSpeed": "Reading speed",
                "pt-volume": "Volume"
            }
        }
    }
    const languageData = returnLanguageData(language)

    document.getElementById('pt-selectYourLang').innerHTML = languageData['pt-selectYourLang']
    document.getElementById('pt-toReadLang').innerHTML = languageData['pt-toReadLang']
    document.getElementById('pt-readingSpeed').innerHTML = languageData['pt-readingSpeed']
    document.getElementById('pt-volume').innerHTML = languageData['pt-volume']
}
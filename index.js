document.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:3000/decks")
    .then(res => res.json())
    .then(res => { 
        globalDeck = null
        res.forEach(renderDecks)
    });
    fetchGlobalCurrentDeckCards()
})

let globalDeck
let allCards
let listDiv = document.querySelector("#list-div")
let globalCurrentDeckCards


//relational Database Function -- async function solution
async function fetchDeckCardsByDeckID(deckID){
    let response = await fetch("http://localhost:3000/deckCards")
    let data = await response.json();
    const deckCardsJSON = data.filter(item => item.deck_id == deckID);
    return deckCardsJSON
}

function renderDecks(deckContent){
    let newDeckDiv = document.createElement("div")
    let newDeckName = document.createElement("p")
    let newDeckDelete = document.createElement("btn")
    let currentDeckName = document.querySelector("#current-deck-name")
    newDeckName.textContent = deckContent.deckName
    newDeckDiv.className = "eachDeckDiv"
    newDeckDelete.textContent = "x"
    newDeckDiv.append(newDeckName, newDeckDelete)
    document.querySelector("#decks").append(newDeckDiv)
    console.log(deckContent)
    newDeckName.addEventListener("click", async () => {
        listDiv.textContent = ""
        globalDeck = deckContent
        currentDeckName.textContent = deckContent.deckName
        console.log(deckContent.id)
        console.log(globalDeck)
        let deckCards = await fetchDeckCardsByDeckID(deckContent.id)
        console.log(deckCards)
        deckCards.forEach(renderList)
    })
    newDeckDelete.addEventListener("click", (e)=> handleDeckDelete(deckContent.id, e))
}

function renderList(deckCards){
    console.log(deckCards)
    let newCardDiv = document.createElement("div")
    let newCardName = document.createElement("p")
    // let newCardDynamicAmmount = document.createElement("div")
    let newCardAmount = document.createElement("p")
    let newCardDelete = document.createElement("btn")
    newCardName.textContent = deckCards.cardName
    newCardAmount.textContent = deckCards.cardQuantity
    newCardDelete.textContent = "x"
    newCardDiv.className = "eachCardDiv"
    newCardName.className = "eachCardName"
    newCardAmount.className = "eachCardAmount"

    // newCardDynamicAmount.append(newCardAmount)
    newCardDiv.append(newCardAmount, newCardName, newCardDelete)
    listDiv.append(newCardDiv)
    newCardName.addEventListener("mouseover", () => {
        setTimeout(()=>{
            fetchHoverByScryfallID(deckCards.scryfallID)
        }, 100)
    });
    newCardDelete.addEventListener("click", (e) => handleCardDelete(deckCards.id, e))
    newCardAmount.addEventListener("click", (e) => handleChangeQuantity(deckCards, e))
}

function updateHoverInfo(updatedInfo){
    console.log(updatedInfo)
    let hoverImage = document.querySelector("#detail-image")
    let hoverName = document.querySelector("#hover-card-name")
    let hoverCardInfo = document.querySelector("#hover-card-info")
    let currentDeckName
    globalDeck == null? currentDeckName = "SELECT DECK" : currentDeckName = `${globalDeck.deckName}`
    addFromHover.textContent = `Add ${updatedInfo.name} to ${currentDeckName}`
    if (updatedInfo.hasOwnProperty("image_uris")) {
        hoverImage.src = updatedInfo["image_uris"]["png"];
        hoverName.textContent = updatedInfo["name"]
        hoverCardInfo.textContent = updatedInfo["oracle_text"]
    } else {
        let frontImage = updatedInfo["card_faces"]["0"]["image_uris"]["png"]
        let backImage = updatedInfo["card_faces"]["1"]["image_uris"]["png"]
        let frontText = updatedInfo["card_faces"]["0"]["oracle_text"]
        let backText = updatedInfo["card_faces"]["1"]["oracle_text"]
        hoverImage.src = frontImage
        hoverName.textContent = updatedInfo["name"]
        hoverCardInfo.textContent = frontText+" // "+backText
        hoverImage.addEventListener("click", ()=> {
            hoverImage.src === frontImage ? hoverImage.src = backImage : hoverImage.src = frontImage
        })
    }
    currentInfo = updatedInfo
}

let addFromHover = document.querySelector("#add-hover-deck")
let currentInfo
addFromHover.addEventListener("click", ()=> hoverAdd(currentInfo))

async function hoverAdd(updatedInfo){
    if(globalDeck !== null){
        let response = await fetch("http://localhost:3000/deckCards")
        let data = await response.json()
        let decksArrayLength = data.length-1
        let currentCardID
        data.length != 0 ? currentCardID = data[`${decksArrayLength}`].id : currentCardID = 0
        const newCard = {
            deck_id: globalDeck.id,
            id: currentCardID + 1,
            cardName: updatedInfo.name,
            cardQuantity: "1",
            scryfallID: updatedInfo.id
        }
        fetch(`http://localhost:3000/deckCards`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newCard)
        })
        .then(response => response.json())
        console.log(newCard)
        renderList(newCard)
    }else{
        alert("Please Select a Deck.")
    }

}

deckForm = document.querySelector("#addNewDeck")
deckForm.addEventListener("submit", (e) => addDeck(e))

async function addDeck(e){
    e.preventDefault()
    let response = await fetch("http://localhost:3000/decks")
    let data = await response.json()
    let decksArrayLength = data.length-1 
    // data.length != 0 ? decksArrayLength = data.length-1 : decksArrayLength = 0
    let currentID 
    data.length != 0 ? currentID = data[`${decksArrayLength}`].id : currentID = 0
    let newDeckObj = {
        id: currentID + 1,
        deckName: e.target["deck-name-input"].value,
        deckType: "TestType"
        }
    console.log(newDeckObj)
    renderDecks(newDeckObj)
    if(e.target["deck-name-input"].value == null){
        alert("Please enter a valid deck name")
    } else{
    fetch(`http://localhost:3000/decks`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newDeckObj)
        })
    }
    deckForm.reset()
}

function handleCardDelete(deckCardID, e){
    if (confirm("Are you sure you want to delete this card?") == true){
        e.target.parentElement.remove()
        fetch(`http://localhost:3000/deckCards/${deckCardID}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
        })
        .then(res => res.json())
    } else{
        console.log("Cancled")
    }
}

async function handleDeckDelete(deckID, e){
    if (confirm("Are you sure you want to delete this deck?") == true){
        e.target.parentElement.remove()
        console.log(deckID)
        fetch(`http://localhost:3000/decks/${deckID}`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
        })
        .then(res => res.json())
        let deckCardsJSON = await fetchDeckCardsByDeckID(deckID)
        deckCardsJSON.forEach(async (id)=> handleDeckContentsDelete(id))
        if(globalDeck.id == deckID){
            listDiv.textContent = ""
            globalDeck = null
            console.log(globalDeck)
        }
    } else{
        console.log("Cancled")
    }
}

function handleDeckContentsDelete(deckCardID){
    console.log(deckCardID.id)
    fetch(`http://localhost:3000/deckCards/${deckCardID.id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
    })
    .then(res => res.json())
}

quickAddForm = document.querySelector("#quick-add")
quickAddForm.addEventListener("submit", (e)=> quickAdd(e))

async function quickAdd(e){
    e.preventDefault()
    let curentValue = e.target["search-db"].value
    if(globalDeck !== null){
        let fuzzyResponse = await fetchFuzzyByName(curentValue)
        if(fuzzyResponse !== false){
            console.log(fuzzyResponse)
            let fuzzyResponseID = fuzzyResponse.id
            let fuzzyResponseName = fuzzyResponse.name
            let response = await fetch("http://localhost:3000/deckCards")
            let data = await response.json()
            let decksArrayLength = data.length-1
            let currentCardID
            data.length != 0 ? currentCardID = data[`${decksArrayLength}`].id : currentCardID = 0
            const newCard = {
                deck_id: globalDeck.id,
                id: currentCardID + 1,
                cardName: fuzzyResponseName,
                cardQuantity: "1",
                scryfallID: fuzzyResponseID
            }
            if(e.target["search-db"].value == null){
                alert("Please enter a valid card.")
            } else{
            fetch(`http://localhost:3000/deckCards`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newCard)
            })
            .then(res => res.json())
            // .then(console.log)
            renderList(newCard)
            quickAddForm.reset()
            }
        }
}else{
    alert("Please Select a Deck.")
}
}

function handleChangeQuantity(deckCards, e){
    let currentCard = deckCards
    let eachCardAmount = e.target
    let currentCardAmount = eachCardAmount.value
    let inputNewCardAmount = document.createElement("input")
    inputNewCardAmount.className = "eachCardAmountInput"
    eachCardAmount.replaceWith(inputNewCardAmount)
    console.log(deckCards)
    inputNewCardAmount.addEventListener("keydown", (e)=> {
        if (e.key === "Enter") {
            if(inputNewCardAmount.value >= 0 && inputNewCardAmount.value <= 99){
            currentCardID = currentCard.id
            inputNewCardAmountValue = 
            currentCardAmount = inputNewCardAmount.value
            inputNewCardAmount.replaceWith(eachCardAmount)
            eachCardAmount.textContent = currentCardAmount
            updateQuantiy(currentCardID, currentCardAmount)
            }
            else{
                alert("Enter a number between 1-99")
            }
        }
    })
}

function updateQuantiy(deckCardsID, inputValue){
    console.log(deckCardsID)
    return fetch(`http://localhost:3000/deckCards/${deckCardsID}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            cardQuantity: inputValue
        })
    })
    .then(res => res.json())
    .then(console.log)
}


function fetchGlobalCurrentDeckCards(){
    fetch('http://localhost:3000/deckCards')
    .then(response => response.json())
    .then(data => {
        console.log(data)
        globalCurrentDeckCards = data
    })
}

function fetchFuzzyByName(cardName){
    let inputName = cardName.replace(/\s/g, '+')
    return fetch(`https://api.scryfall.com/cards/named?fuzzy=${inputName}`)
    .then((response) => {
        if (!response.ok) {
            if (response.status === 404) {
            // Check for 404 (Not Found) response and handle it
            alert("Please enter a valid card.")
            return false
            } else {
            // Handle other non-404 errors here if needed
            throw new Error('Request failed with status: ' + response.status);
            }
        }
        return response.json()
    })
}

// fetchFuzzyByName("Please")

function fetchHoverByScryfallID(scryfallID){
    fetch(`https://api.scryfall.com/cards/${scryfallID}`)
    .then(response => response.json())
    .then(response => updateHoverInfo(response))
}

// fetchByScryfallID("dd4a00ff-2206-4e12-a0ab-61ed82c9e6c5")


function compileSearch(e){
    e.preventDefault()
    let searchul = document.querySelector("#search-results-ul")
    searchul.textContent = ""
    const sortBy = document.querySelector("#search-order").value
    const searchType = document.querySelector("#search-type").value
    let searchTypeOutput
    searchType === "" ? searchTypeOutput = "" : searchTypeOutput = "type_line="+searchType
    let cTotal = wOutput+uOutput+bOutput+rOutput+gOutput
    let cOutput = ""
    cTotal === "" ? cOutput = "" : cOutput = "+color%3A"+cTotal
    const powerCompare = document.querySelector("#power-compare").value
    const powerValue = document.querySelector("#power-value").value
    let powerCompareOutput = ""
    powerValue === "" ? powerCompareOutput = "" : powerCompareOutput = "+power"+powerCompare+powerValue
    const toughnessCompare = document.querySelector("#toughness-compare").value
    const toughnessValue = document.querySelector("#toughness-value").value
    let toughnessCompareOutput = ""
    toughnessValue === "" ? toughnessCompareOutput = "" : toughnessCompareOutput = "+toughness"+toughnessCompare+toughnessValue
    const cmcCompare = document.querySelector("#cmc-compare").value
    const cmcValue = document.querySelector("#cmc-value").value
    let cmcCompareOutput = ""
    cmcValue === "" ? cmcCompareOutput = "" : cmcCompareOutput = "+cmc"+cmcCompare+cmcValue
    let searchNameValue = document.querySelector("#search-scryfall").value
    let searchNameValueOutput = ""
    searchNameValue === "" ? searchNameValueOutput = "" : searchNameValueOutput = "name%3D"+searchNameValue
    let allOutput = cmcCompareOutput+toughnessCompareOutput+powerCompareOutput+cOutput+searchTypeOutput+searchNameValueOutput
    console.log(powerValue)
    if(allOutput === ""){
        alert("Please change one or more values before searching.")
    }else{
    console.log(`https://api.scryfall.com/cards/search?order=${sortBy}&q=${searchTypeOutput}${cOutput}${powerCompareOutput}${toughnessCompareOutput}${cmcCompareOutput}${searchNameValueOutput}`)
    fetch(`https://api.scryfall.com/cards/search?order=${sortBy}&q=${searchTypeOutput}${cOutput}${powerCompareOutput}${toughnessCompareOutput}${cmcCompareOutput}${searchNameValueOutput}`)
    .then((response) => {
        if (!response.ok) {
            searchTermCount.textContent = `Found 0 cards using the search term: \"${searchNameValue}\"`
        }
        return response.json()
    })
    .then(response => {
        response.data.forEach(appendSearch)
        if(response.has_more.value === true){
            searchTermCount.textContent = `Displaying ${response.data.length} of the ${response.data.length} found cards using the search term: \"${searchNameValue}\"`
            console.log(response)
        }else{
            searchTermCount.textContent = `Displaying ${response.data.length} of the ${`${response.total_cards}`} found cards using the search term: \"${searchNameValue}\"`
            console.log(response)
        }
    })
    .then(searchForm.reset())
    }
}


const searchTermCount = document.querySelector("#search-term-count")
const wCheck = document.querySelector("#wCheck")
wCheck.addEventListener("change", () => {wCheck.checked ? wOutput = "white" : wOutput = ""})
let wOutput = ""
const uCheck = document.querySelector("#uCheck")
uCheck.addEventListener("change", () => {uCheck.checked ? uOutput = "blue" : uOutput = ""})
let uOutput = ""
const bCheck = document.querySelector("#bCheck")
bCheck.addEventListener("change", () => {bCheck.checked ? bOutput = "black" : bOutput = ""})
let bOutput = ""
const rCheck = document.querySelector("#rCheck")
rCheck.addEventListener("change", () => {rCheck.checked ? rOutput = "red" : rOutput = ""})
let rOutput = ""
const gCheck = document.querySelector("#gCheck")
rCheck.addEventListener("change", () => {gCheck.checked ? gOutput = "green" : gOutput = ""})
let gOutput = ""

// const CheckW = document.querySelector("#wCheck")
// CheckW.addEventListener("change", () => console.log(CheckW))

const searchForm = document.querySelector("#search-cards")
searchForm.addEventListener("submit", (e)=>compileSearch(e))

function appendSearch(card){
    let searchul = document.querySelector("#search-results-ul")
    let newSearchCardDiv = document.createElement("div")
    newSearchCardDiv.id = card.id
    let newSearchCardp = document.createElement("p")
    newSearchCardp.textContent = card.name
    newSearchCardDiv.append(newSearchCardp)
    searchul.append(newSearchCardDiv)
    newSearchCardp.addEventListener("click", () => {
        setTimeout(()=>{
            fetchHoverByScryfallID(card.id)
        }, 100)
    });
}


// function fetchAuotcomplete(input){
//     return fetch(`https://api.scryfall.com/cards/autocomplete?q=${input}`)
//     .then(response => response.json())
//     .then(console.log)
// }

// fetchAuotcomplete("Mox")
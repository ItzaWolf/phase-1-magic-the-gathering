//TODO: On Deck Delete, Set Global Deck to a different deck  

document.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:3000/decks")
    .then(res => res.json())
    .then(res => { 
        globalDeck = null
        res.forEach(renderDecks)
    });
    fetchAllCardNames()
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
    hoverImage.src = updatedInfo["image_uris"]["png"]
    hoverName.textContent = updatedInfo["name"]
    hoverCardInfo.textContent = updatedInfo["oracle_text"]
}

deckForm = document.querySelector("#addNewDeck")
deckForm.addEventListener("submit", (e) => addDeck(e))

async function addDeck(e){
    e.preventDefault()

    let response = await fetch("http://localhost:3000/decks")
    let data = await response.json()
    let decksArrayLength = data.length-1
    let currentID = data[`${decksArrayLength}`].id
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
            let currentCardID = data[`${decksArrayLength}`].id
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

//API Interaction
//Fetches All Card Names
function fetchAllCardNames(){
    setTimeout(()=>{
        fetch('https://api.scryfall.com/catalog/card-names')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            allCards = data
        })
    }, 100)
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

function fetchAuotcomplete(input){
    return fetch(`https://api.scryfall.com/cards/autocomplete?q=${input}`)
    .then(response => response.json())
    .then(console.log)
}

// function fetchAuotcomplete(input){
//     setTimeout(()=>{
//         return fetch(`https://api.scryfall.com/cards/autocomplete?q=${input}`)
//         .then(response => response.json())
//         .then(console.log)
//     }, 100)
// }

fetchAuotcomplete("Mox")

// function checkIfSolo(inputArray){
//     if(inputArray.length === 1){
//        //Excecute function 
//     }
//     else if(inputArray.length >= 2){
//         alert("The value you entered has multiple results.")
//     }
//     else{
//         alert("The value you inputed has no matching resuts.")
//     }
// }

// function updateSearches(){
// }

//Compare Input to All Card Names
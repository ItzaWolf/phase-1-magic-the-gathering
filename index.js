//TODO: On Deck Delete, Set Global Deck to a different deck

document.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:3000/decks")
    .then(res => res.json())
    .then(res => { 
        globalDeck = res["0"]
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
    newDeckName.textContent = deckContent.deckName
    newDeckDiv.className = "eachDeckDiv"
    newDeckDelete.textContent = "x"
    newDeckDiv.append(newDeckName, newDeckDelete)
    document.querySelector("#decks").append(newDeckDiv)
    newDeckName.addEventListener("click", async () => {
        listDiv.textContent = ""
        globalDeck = deckContent
        console.log(deckContent.id)
        //change the for each to itterate through 
        let deckCards = await fetchDeckCardsByDeckID(deckContent.id)
        deckCards.forEach(renderList)
    })
    newDeckDelete.addEventListener("click", (e)=> handleDeckDelete(deckContent.id, e))
}

function renderList(deckCards){
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
        handleFetchHoverInfo(deckCards.scryfallID)
    });
    newCardDelete.addEventListener("click", (e) => handleCardDelete(deckCards.id, e))
    newCardAmount.addEventListener("click", (e) => handleChangeQuantity(deckCards, e))
}

function handleFetchHoverInfo(inputID){
    let updatedID
    fetch(`http://localhost:3000/cards`)
    .then(res => res.json())
    .then(res => {
        updatedID = res.filter((res) => res.scryfallID == inputID );
        updateHoverInfo(updatedID)
    });
}

function updateHoverInfo(updatedID){
    console.log(updatedID)
    console.log(updatedID["0"]["cardName"])
    hoverImage = document.querySelector("#detail-image")
    hoverName = document.querySelector("#hover-card-name")
    hoverInfo = document.querySelector("#hover-card-info")
    hoverImage.src = updatedID["0"]["cardImage"]
    hoverName.textContent = updatedID["0"]["cardName"]
    hoverInfo.textContent = updatedID["0"]["cardRules"]
}

deckForm = document.querySelector("#addNewDeck")
deckForm.addEventListener("submit", (e) => addDeck(e))

function addDeck(e){
    e.preventDefault()
    let newDeckObj = {
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
        console.log(deckCardsJSON)
        deckCardsJSON.forEach((id)=> handleDeckContentsDelete(id))
        if(globalDeck.id == deckID){
            listDiv.textContent = ""

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

function quickAdd(e){
    e.preventDefault()
    const newCard = {
        deck_id: globalDeck.id,
        cardName: e.target["search-db"].value,
        cardQuantity: "1",
        scryfallID: "IDHERE1"
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

function handleChangeQuantity(deckCards, e){
    let eachCardAmount = e.target
    let currentCardAmount = eachCardAmount.value
    let inputNewCardAmount = document.createElement("input")
    inputNewCardAmount.className = "eachCardAmountInput"
    eachCardAmount.replaceWith(inputNewCardAmount)
    console.log(deckCards)
    inputNewCardAmount.addEventListener("keydown", (e)=>{
        if (e.key === "Enter") {
            if(inputNewCardAmount.value >= 0 && inputNewCardAmount.value <= 99){
            currentCardAmount = inputNewCardAmount.value
            inputNewCardAmount.replaceWith(eachCardAmount)
            eachCardAmount.textContent = currentCardAmount
            updateQuantiy(deckCards.id, inputNewCardAmount.value)
            }
            else{
                alert("Enter a number between 1-99")
            }
        }
    })
}


function updateQuantiy(deckCardsID, inputValue){
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

// function fetchIndiCardScryfall(){
//     fetch('https://api.scryfall.com/cards/named?fuzzy=com+aust')
//     .then(response => response.json())
//     .then(data => {
//         console.log(data)
//         allCards = data
//     })
// }

// fetchIndiCardScryfall()

function fetchFuzyIndiCardScryfall(cardName){
    let inputName = cardName.replace(/\s/g, '+')
    return fetch(`https://api.scryfall.com/cards/named?fuzzy=${inputName}`)
    .then(response => response.json())
    .then(console.log)
}

fetchFuzyIndiCardScryfall("Ashi Adept")


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

fetchAuotcomplete("Ashiok")

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
document.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:3000/decks")
    .then(res => res.json())
    .then(res => { 
        globalDeck = res["0"]
        res.forEach(renderDecks)
    });
})

let globalDeck
let listDiv = document.querySelector("#list-div")

function renderDecks(deckContent){
    newDeckDiv = document.createElement("div")
    newDeckName = document.createElement("p")
    newDeckName.textContent = deckContent.deckName
    newDeckDiv.className = "eachDeckDiv"
    newDeckDiv.append(newDeckName)
    document.querySelector("#decks").append(newDeckDiv)
    newDeckName.addEventListener("click", () => {
        listDiv.textContent = ""
        globalDeck = deckContent
        deckContent.deckCards.forEach(renderList)
    })
}

function renderList(deckCards){
    newCardDiv = document.createElement("div")
    newCardName = document.createElement("p")
    newCardAmmount = document.createElement("p")
    newCardDelete = document.createElement("btn")
    newCardName.textContent = deckCards.cardName
    newCardAmmount.textContent = deckCards.cardQuantity
    newCardDelete.textContent = "x"
    newCardDiv.className = "eachCardDiv"
    newCardDiv.append(newCardAmmount, newCardName, newCardDelete)
    listDiv.append(newCardDiv)
    newCardName.addEventListener("mouseover", () => {
        handleFetchHoverInfo(deckCards.scryfallID)
    });
    newCardDelete.addEventListener("click", (e) => handleDelete(e))
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

function handleFetchHoverInfo(inputID){
    let updatedID
    fetch(`http://localhost:3000/cards`)
    .then(res => res.json())
    .then(res => {
        updatedID = res.filter((res) => res.scryfallID == inputID );
        updateHoverInfo(updatedID)
    });
}

deckForm = document.querySelector("#addNewDeck")
deckForm.addEventListener("submit", (e) => addDeck(e))

function addDeck(e){
    e.preventDefault()
    indiDeck = document.createElement("div")
    deckName = document.createElement("p")
    deckDelete = document.createElement("btn")
    deckName.textContent = e.target["deck-name-input"].value
    deckDelete.textContent = "Delete"
    decksDiv = document.querySelector("#decks")
    indiDeck.className = "indiDeck"
    indiDeck.append(deckName, deckDelete)
    decksDiv.append(indiDeck)
    deckDelete.addEventListener("click", (e)=> handleDelete(e))
    console.log("deck added")
}

function handleDelete(e){
    if (confirm("Are you sure you want to delete this?") == true){
        e.target.parentElement.remove()
    } else{
        console.log("Cancled")
    }
}

quickAddForm = document.querySelector("#quick-add")
quickAddForm.addEventListener("submit", (e)=> quickAdd(e))

function quickAdd(e){
    e.preventDefault()
    const newCard = {
        cardName: e.target["search-db"].value,
        cardQuantity: "1",
        scryfallID: "IDHERE1"
    }
    globalDeck.deckCards.push(newCard)
    fetch(`http://localhost:3000/decks/${globalDeck.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(globalDeck)
    })
    .then(res => res.json())
    .then(console.log)
    // .then(res => renderDecks(res));
}

// function quickAdd(e){
//     e.preventDefault()
//     const newCard = {
//         cardName: e.target["search-db"].value,
//         cardQuantity: "1",
//         scryfallID: "IDHERE1"
//     }
//     fetch(`http://localhost:3000/decks/${globalDeck.id}`)
//     .then(res => res.json())
//     .then(res =>{
//         const currentDeckCards = res.deckCards
//         currentDeckCards.push(newCard)
//     })
    
//     fetch(`http://localhost:3000/decks/${globalDeck.id}/deckCards`, {
//         // method: "POST",
//         // headers: {"Content-Type": "application/json"},
//         // body: JSON.stringify(newCard)
//     })
//     .then(res => res.json())
//     .then(console.log)
//     // .then(res => renderDecks(res));
// }

// function updateHoverInfo(inputID){
//     console.log(inputID)
//     console.log(handleFetchHoverInfo(inputID))
//     hoverImage = document.querySelector("#detail-image")
// }

// function handleFetchHoverInfo(inputID){
//     let updatedID
//     fetch(`http://localhost:3000/cards`)
//     .then(res => res.json())
//     .then(res => {
//         updatedID = res.filter((res) => res.scryfallID == inputID );
//     });
//     return updatedID
// }

// function callSryfall(){
//     return fetch("https://api.scryfall.com/cards/autocomplete?q=thal")
//     .then(res => res.json())
// }

// console.log(callSryfall())
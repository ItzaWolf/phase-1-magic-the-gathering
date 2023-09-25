document.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:3000/decks")
    .then(res => res.json())
    .then(res => { 
        globalDeck = res["0"]
        res.forEach(renderDecks)
    });
    // fetch("http://localhost:3000/decks")
    // .then(res => res.json())
    // .then(res =>{
    //     globalCard= res["0"]
    // });
})

let globalDeck
let listDiv = document.querySelector("#list-div")
let globalCard

function renderDecks(deckContent){
    newDeckDiv = document.createElement("div")
    newDeckName = document.createElement("p")
    newDeckName.textContent = deckContent.deckName
    newDeckDiv.className = "eachDeckDiv"
    newDeckDiv.append(newDeckName)
    document.querySelector("#decks").append(newDeckDiv)
    newDeckName.addEventListener("click", () => {
        listDiv.textContent = ""
        deckContent.deckCards.forEach(renderList)})
}

function renderList(deckCards){
    newCardDiv = document.createElement("div")
    newCardName = document.createElement("p")
    newCardAmmount = document.createElement("p")
    newCardName.textContent = deckCards.cardName
    newCardAmmount.textContent = deckCards.cardQuantity
    newCardDiv.className = "eachCardDiv"
    newCardDiv.append(newCardAmmount, newCardName)
    listDiv.append(newCardDiv)
    newCardName.addEventListener("mouseover", () => {
        handleFetchHoverInfo(deckCards.scryfallID)
    });
}

function updateHoverInfo(updatedID){
    console.log(updatedID)
    hoverImage = document.querySelector("#detail-image")
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
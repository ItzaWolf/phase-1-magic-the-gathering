//WORK ON THE RELATIONAL DB

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


//async functions solution
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


//cleaned up attempt using.filter
// function fetchDeckCardsByDeckID(deckID){
//     let deckCardsJSON
//     fetch("http://localhost:3000/deckCards")
//     .then(res => res.json())
//     .then(res => {
//         deckCardsJSON = res.filter((res) => res.deck_id == deckID);
//         return deckCardsJSON
//         })
// }

    //attempt using .filter
    // function handleFetchDeckCardsByDeckID(deckID){
    //     // const deckList = [];
    //     console.log(deckID)
    //     let decksJSON
    //     let deckCardsJSON
    //     // fetch("http://localhost:3000/decks")
    //     // .then(res => res.json())
    //     // .then(res => res)
    //     fetch("http://localhost:3000/deckCards")
    //     .then(res => res.json())
    //     .then(res => {
    //         deckCardsJSON = res
    //         deckCardsJSON = res.filter((res) => res.deck_id == deckID );
    //         console.log(deckCardsJSON)
    //         // updatedID = res.filter((res) => res.scryfallID == inputID );
    //         // updateHoverInfo(updatedID)
    //         })
    // }

    //attempt using fetches outside of original function:: getting async errors
    // function handleFetchDeckCardsByDeckID(){
    //     let decksJSON
    //     let deckCardsJSON
    //     fetch("http://localhost:3000/decks")
    //     .then(res => res.json())
    //     .then(res => decksJSON = res)
    //     fetch("http://localhost:3000/deckCards")
    //     .then(res => res.json())
    //     .then(res => deckCardsJSON = res)
    // }

    //1st attempt baed off of example given by chatGPT
    // function fetchDeckCardsByDeckID(decksID){
        // const deckList = [];
        // let decksJSON
        // let deckCardsJSON
        // fetch("http://localhost:3000/decks")
        // .then(res => res.json())
        // .then(res => decksJSON = res)
        // fetch("http://localhost:3000/deckCards")
        // .then(res => res.json())
        // .then(res => deckCardsJSON = res)
        // console.log(decksJSON)
        // console.log(deckCardsJSON)
            // for (const cards of deckCardsJSON) {
            //     if (cards.deck_id === deckID) {
            //       // Find the user information for the post's user_id
            //       const user = decksJSON.find((deck) => deck.id === deckID);
            //       if (user) {
            //         deckList.push({
            //           cards,
            //           decks
            //         });
            //       }
            //     }
            //   }
            //   return deckList;
            // }

    //example given by chatGPT
    // function fetchPostsByUserId(userId) {
    //   const userPosts = [];
    //     for (const post of jsonData.posts) {
    //         if (post.user_id === userId) {
    //           // Find the user information for the post's user_id
    //           const user = jsonData.users.find((user) => user.id === userId);
    //           if (user) {
    //             userPosts.push({
    //               post,
    //               user
    //             });
    //           }
    //         }
    //       }
        
    //       return userPosts;
    //     }

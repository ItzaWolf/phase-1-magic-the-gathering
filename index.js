const test = 0


function callSryfall(){
    fetch("https://api.scryfall.com")
    .then(res => res.json())
}

console.log(callSryfall())
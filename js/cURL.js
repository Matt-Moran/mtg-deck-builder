//Create User Variables
var mainboard = Array();
var sideboard = Array();
var deck = {
    mainboard: mainboard,
    sideboard: sideboard
};

//When the socket 'searchRequest' is sent
function searchRequest(data){
        
        var cardArrayUnique = cardArray.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        })
        console.log(cardArrayUnique);
    })
}

socket.on('addCardSearch', function addCardSearch(data){
    var addCardList = Array();
    mtg.card.where({ name: data.cardName})
    .then(card => {
            for(var i = 0; i < card.length; i++){
                if(card[i].name == data.cardName) addCardList.push(card[i].id);
            }
            var v = addCardList.length-1;
            if(v != -1) addCardFromID(addCardList[v]);
    })
});

socket.on('addCard', function addCard(data){
    addCardFromID(data.cardID);
});

socket.on('removeCard', function removeCard(data){
    for(var i = 0; i < mainboard.length; i++){
        if(mainboard[i].id == data.cardID){
            mainboard[i].count -= 1;
            if (mainboard[i].count == 0) mainboard.splice(i,1);
            sendDeck();
            return;
        }
    }
    sendDeck();
    return;
});

socket.on('exportDeck', function exportDeck(data){
    if(data.request = true){
        var deckJson = JSON.stringify(deck);
        var deckUrl =  "text/json;charset=utf-8," + encodeURIComponent(deckJson);
        socket.emit('export',{
            export:deckJson
        });
    }
});

socket.on('importDeck', function importDeck(data){
    pushDeck(data.deckObject.mainboard, data.deckObject.sideboard);
});

socket.on('printDeck', function exportCard(data){
    if(data.request = true){
        socket.emit('export',{
            print:"print"
        });
    }
});

function addCardFromID(id){
    var countUp = false;
    if(mainboard.length == 0) return pushCard(id);
    else{
        for(var i = 0; i < mainboard.length; i++){
            if(mainboard[i].id == id){
                mainboard[i].count += 1;
                countUp = true;
                return sendDeck();
            }
        }
        if(countUp == false) return pushCard(id);
    }
}

function pushCard(cardID){
    mtg.card.find(cardID)
    .then(result => {
        mainboard.push({count:1, card:result.card.name, url:result.card.imageUrl, id:cardID});
    })
    .then(function() {
        deck.mainboard = mainboard;
        deck.sideboard = sideboard;
        sendDeck();
    });
}


function pushDeck(mb, sb){
    deck.mainboard = mb;
    deck.sideboard = sb;
    return sendDeck();
}

function sendDeck(){
    socket.emit('deck',{
        deck:deck
    });
    console.log(deck);
}
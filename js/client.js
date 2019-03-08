var mainboard = Array();
var sideboard = Array();
var deck = {
    mainboard: mainboard,
    sideboard: sideboard
};
var searchInput = document.getElementById('searchInput');
var searchFormat = document.getElementById('searchFormat');

//END OF GLOBAL VARIABLES
/*START OF CARD SEARCH
----------------------------------------*/
function loader(){
    document.getElementById('main-loader-section').setAttribute("style", "opacity: 0;");
}

searchInput.oninput = function(){
    var cardArray = Array();
    var cardRec = document.getElementById("cardRecData");
    var length;
    $.getJSON("https://api.magicthegathering.io/v1/cards?pageSize=20&name="+searchInput.value+"", function(data){
        for(i = 0; i < data.cards.length; i++){
            cardArray.push(data.cards[i].name);
        }
        var cardArrayUnique = cardArray.filter(function(elem, index, self) {
            return index == self.indexOf(elem);
        });
        length = cardArrayUnique.length;
        if(length > 1){
            var tempInnerHTML = "";
            for(var i = 0; i < length; i++){
                tempInnerHTML += '<option value="'+cardArrayUnique[i]+'"></option>';  
            }
            cardRec.innerHTML = tempInnerHTML;
        }
    });
};


function addCardSearch(){
    $.getJSON("https://api.magicthegathering.io/v1/cards?name="+searchInput.value+"", function(data){
        var addCardList = Array();
        for(var i = 0; i < data.cards.length; i++){
            if(data.cards[i].name == searchInput.value){
                addCardList.push(data.cards[i].id);
            }
        }
        var v = addCardList.length-1;
        if(v != -1) addCard(addCardList[v]);
    });
}

function addCard(id){
    if(deck.mainboard.length == 0) return pushCard(id);
    else{
        for(var i = 0; i < deck.mainboard.length; i++){
            if(deck.mainboard[i].id == id){
                deck.mainboard[i].count += 1;
                countUp = true;
                return postDeck();
            }
            else if(i == deck.mainboard.length-1){
                return pushCard(id);
            }
        }
    }
}

function pushCard(id){
    console.log(id);
     $.getJSON("https://api.magicthegathering.io/v1/cards/"+id, function(data){
        deck.mainboard.push({count:1, card:data.card.name, url:data.card.imageUrl, id:id});
        postDeck();
    });
}

function removeCard(id){
    for(var i = 0; i < deck.mainboard.length; i++){
        if(deck.mainboard[i].id == id){
            deck.mainboard[i].count -= 1;
            if (deck.mainboard[i].count == 0) deck.mainboard.splice(i,1);
            return postDeck();
        }
    }
}

function exportDeck(){
    var deckJson = JSON.stringify(deck);
    console.log(deckJson);
    var blob = new Blob([deckJson], {type: "application/json"});
    var url  = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download    = "deck.json";
    a.href        = url;
    a.textContent = "deck.json";
    a.id = "download";
    document.getElementById('export').appendChild(a);
    document.getElementById('download').click();
}

function importDeck(){
    var files = document.getElementById('selectFiles').files;
    if (files.length <= 0) {
        return false;
    }
    var fr = new FileReader();
    fr.onload = function(e) { 
        var result = JSON.parse(e.target.result);
        deck = result;
        postDeck();
    }
    fr.readAsText(files.item(0));
}

function postDeck(){
    var deckDiv = document.getElementById("deck");
    deckDiv.innerHTML = "<h3>Mainboard</h3><hr>";

    for(var i = 0; i < deck.mainboard.length; i++){
        var cardVar = "('"+deck.mainboard[i].id+"')"
        deckDiv.innerHTML += '<div class="main-card"><p>' + deck.mainboard[i].count + 'x ' + deck.mainboard[i].card + '</p><a class="main-icon-card" uk-icon="icon: plus; ratio: 1.2" onclick="addCard' + cardVar + '"></a><a class="main-icon-card" uk-icon="icon: minus; ratio: 1.2" onclick="removeCard' + cardVar + '"></a><a class="main-icon-card" uk-icon="icon: arrow-down; ratio: 1.2" onclick="moveToSideboard' + cardVar + '"></a><br><img src="' + deck.mainboard[i].url + '"></div>';
    }
    deckDiv.innerHTML += "<h3>Sideboard</h3><hr>";
    for(var i = 0; i < deck.sideboard.length; i++){
        var cardVar = "('"+deck.sideboard[i].id+"')"
        deckDiv.innerHTML += '<div class="main-card"><p>' + deck.sideboard[i].count + 'x ' + deck.sideboard[i].card + '</p><a class="main-plus-card" uk-icon="icon: plus; ratio: 1.2" onclick="addCard' + cardVar + '"></a><a class="main-minus-card" uk-icon="icon: minus; ratio: 1.2" onclick="removeCard' + cardVar + '"></a><br><img src="' + deck.sideboard[i].url + '"></div>';
    }
}
"use strict";
import Hand from './hand.js';
export default class Player{
    constructor(userID, playerName, cleaner, index, isRando, includeDescription){
        this.index=index;           this.id=userID;         this.name=playerName;       
        this.isRando=isRando;       this.cleaner=cleaner;   this.score=0;
        this.hand=undefined;        this.won=[];            this.includeDescription=includeDescription;          
    }
    startRound(deck, drawCount, firstPlayerName, prefix, isPlayWaiting, chosenCard, showFull){
        this.hand = new Hand(drawCount, deck);  this.showCards();    this.won=[];
        if(!this.isRando){this.cleaner.sendMessageToSinglePlayer(this.index,"instruct","Welcome to the game!\n**" + firstPlayerName +(isPlayWaiting ? "** has chosen **" + chosenCard  + "**": "** will play the character ") + " to seek matches for emotionally bonded partnerships by entering the number of a card from their hand.\n" + (isPlayWaiting ? "Select " : "The other players will then select ") + "a card or group of cards, entering numbers in one command separated by spaces.\n" + firstPlayerName + " will then view the cards with the command **" + prefix + "show**, and select the winning group for this round.\n*Optional Hard Mode: " + firstPlayerName + " will give a story prompt that the players will have to answer when the cards are revealed; e.g. 'Tell me how they met'*");}
    }
    discardCards(msg, deck, msgContent){
        var chosenCardIndices=this.splitList(msgContent, " ");this.splitList(msgContent, " ");
        if(!this.checkCards(msg, chosenCardIndices)){return undefined;}
        if(chosenCardIndices.length===0){this.cleaner.sendReplyMessage(msg, "other","Error: No cards selected");  return undefined;}
        var chosenCards=[];
        for(var i=0;i<chosenCardIndices.length;i++){
            chosenCards.push(this.hand.cards[chosenCardIndices[i]-1]);
        }
        for(var i=0;i<chosenCards.length;i++){
            this.hand.discardAndDraw(this.hand.cards.findIndex(x=>x===chosenCards[i])+1,deck, deck, false, false, this.name, msg, this.cleaner);
        }
        this.showCards();
        return chosenCards;
    }
    playCards(msg, msgContent, oneCardOnly, deck){
        var chosenCardIndices=this.splitList(msgContent, " ");this.splitList(msgContent, " ");
        if(!this.checkCards(msg, chosenCardIndices)){return undefined;}
        if(chosenCardIndices.length!==1 && oneCardOnly){this.cleaner.sendReplyMessage(msg, "other","Error: You can only select one card for matching");  return undefined;}
        if(chosenCardIndices.length===0){this.cleaner.sendReplyMessage(msg, "other","Error: No cards selected");  return undefined;}
        var chosenCards=[];
        for(var i=0;i<chosenCardIndices.length;i++){
            chosenCards.push(this.hand.cards[chosenCardIndices[i]-1]);
        }
        for(var i=0;i<chosenCards.length;i++){
            this.hand.play(this.hand.cards.findIndex(x=>x===chosenCards[i])+1,msg, this.cleaner);
            this.hand.draw(deck, false, this.name);
        }
        this.showCards();
        return oneCardOnly ? chosenCards[0] : chosenCards;
    }
    playRando(deck){
        var cards=[];
        var numPlay=1+Math.floor(3.0*Math.random());
        for(var i=0;i<numPlay;i++){
            cards.push(deck.draw(false, this.name));
        }
        return cards;
    }
    showCards(){
        this.cleaner.sendMessageToSinglePlayer(this.index, "hand", "You have the following hand of cards:\n" + this.hand.showCardText((this.includeDescription ? "fulltext" : "smalltext")));
    }
    addWin(wonText){
        this.won.push(wonText);
    }
    splitList(text,splChar){
        var text2=text.trim();      var text1="";   var returnList=[];
        var spFind=text2.indexOf(splChar);
        while (spFind!==-1) {
            text1=text2.substring(0,spFind);
            text2=text2.substring(spFind+1).trim();
            returnList.push(text1);
            spFind = text2.indexOf(splChar);
        }
        if(text2!==""){returnList.push(text2);}
        return returnList;
    }
    checkCards(msg, splitList){
        for(var i=0;i<splitList.length;i++){
            var newCardIndex=Number(splitList[i]);
            if(isNaN(newCardIndex)){this.cleaner.sendReplyMessage(msg, "other", "Error: Invalid card index: " + newCardIndex); return false;}
            if(newCardIndex<=0 || newCardIndex>this.hand.cards.length || Number.isInteger(newCardIndex)==false){this.cleaner.sendReplyMessage(msg, "other", "Error: Invalid card index"); return false;}
            for(var j=0;j<i;j++){
                if(Number(splitList[j])===Number(splitList[i])){this.cleaner.sendReplyMessage(msg, "other", "Error: You have listed the same card more than once"); return false;}
            }
        }
        return true;
    }

}



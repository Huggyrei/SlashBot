"use strict";
// Represents a player's hand
export default class Hand{
    constructor(numDraws, drawDeck){
        this.redrawHand(numDraws,drawDeck);
    }
    redrawHand(numDraws, drawDeck){
        this.cards=[];
        for(var i=0;i<numDraws;i++){
            this.draw(drawDeck,false,"");
        }
    }
    play(cardNumber,msg,cleaner){
        cardNumber=Number(cardNumber)
        if(isNaN(cardNumber)){cleaner.sendReplyMessage(msg, "other", "Invalid card selection"); return undefined;}
        if(!Number.isInteger(cardNumber) || cardNumber<1 || cardNumber>this.cards.length ){cleaner.sendReplyMessage(msg, "other", "Invalid card selection"); return undefined;}
        var card=this.cards[cardNumber-1];
        this.cards.splice(cardNumber-1,1);
        return card;
    }
    discard(cardNumber, deck, reportDiscard, playerName, msg, cleaner, reportProperty){
        var card = this.play(cardNumber, msg, cleaner);
        if(card=undefined){return false;}
        deck.discardCard(reportDiscard, card, playerName, reportProperty);
        return true;
    }
    discardAll(deck, reportDiscard, playerName, cleaner, reportProperty){
        for(var i=0;i<this.cards.length;i++){
            deck.discardCard(reportDiscard, this.cards[i], playerName, reportProperty);
        }
        this.cards=[];
        return true;
    }
    draw(drawDeck, reportDraw, playerName){
        var card=drawDeck.draw(reportDraw,playerName);
        if(card){this.cards.push(card); return true;}else{return false;}
    }
    discardAndDraw(cardNumber, discardDeck, drawDeck, reportDiscard, reportDraw, playerName, msg, cleaner){
        var disc=this.discard(cardNumber, discardDeck, reportDiscard, playerName, msg, cleaner);
        if(disc){this.draw(drawDeck,reportDraw,playerName);}
        return disc;
    }
    drawDiscard(drawDeck, reportDraw, playerName, reportProperty){
        var card=drawDeck.drawDiscard(reportDraw,playerName, reportProperty);
        if(card){this.cards.push(card);return true;}else{return false;}
    }
    addCard(card){
        if(card){this.cards.push(card);}
    }
    showCardText(textProperty){
        var msgContent=this.cards.length===0 ? "You have no cards" : " [**1**] : " + this.cards[0][textProperty];
        for(var i=1;i<this.cards.length;i++){
            msgContent = msgContent + "\n [**" + (i+1) + "**] : " + this.cards[i][textProperty];
        }
        return msgContent;
    }
    showCardTextSmall(textProperty){
        var msgContent=this.cards.length===0 ? "You have no cards" : this.cards[0][textProperty];
        for(var i=1;i<this.cards.length;i++){
            msgContent = msgContent + ",     " + this.cards[i][textProperty];
        }
        return msgContent;
    }
    sort(sortProperty){
        if(this.cards.length==0){return;}
        if(typeof(this.cards[0][sortProperty])=="string"){this.cards=this.cards.sort((a,b)=>a[sortProperty].localeCompare(b[sortProperty]));}
        else{this.cards=this.cards.sort((a,b)=>a-b);}
    }
}
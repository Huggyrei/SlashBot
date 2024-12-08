"use strict";
export default class Deck{
    constructor(deckName, startDeck, cleaner, allowReshuffle){
        this.startDeck=startDeck;   this.cleaner=cleaner;   this.allowReshuffle=allowReshuffle; this.name=deckName;
        this.cleaner.addSentMessageTypePlayers(deckName + "_draw");
        this.cleaner.addSentMessageTypePlayers(deckName + "_discard");
		this.cleaner.addSentMessageTypePlayers(deckName + "_played");
        this.cleaner.addSentMessageTypePlayers(deckName + "_deck");     
        this.reset();
    }
    reset(){
        this.deck=this.startDeck;   this.shuffle(this.deck);    this.discard=[];
		this.played=[];
    }
    shuffle(carddeck){
        if(carddeck.lenth===0) {return;}
        for (var i = carddeck.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            [carddeck[i], carddeck[j]] = [carddeck[j], carddeck[i]];
        }
	}
    draw(report, playerName){
		if(this.deck.length===0){
            if(!this.allowReshuffle || this.discard.length==0){return undefined;}
			this.deck=this.discard;			this.discard=[];		this.shuffle(this.deck);
		}
		var card = this.deck[0];	this.deck.splice(0,1);		
		if(report){this.cleaner.sendMessageToAllPlayers(this.name+"_draw",playerName + " has drawn a card from the deck");}
		return card;
	}
	drawDiscard(report, playerName, reportProperty){
		if(this.discard.length===0){return undefined;}
		var card = this.discard[this.discard.length-1];	this.discard.splice(this.discard.length-1,1);	
		if(report) this.cleaner.sendMessageToAllPlayers(this.name+"_draw",playerName + " has drawn the card " + card[reportProperty] + " from the discard pile");
		return card;
	}
	playCard(report, playedCard, playerName, reportProperty){
		this.played.push(playedCard);
        if(report){
		    this.cleaner.sendMessageToAllPlayers(this.name+"_played",playerName + " has played the card " + playedCard[reportProperty]);
        }
	}
	playCardList(report, playedCardList, playerName, reportProperty){
		var msgContent=playerName + (playedCardList.length===0 ? " has played no cards." : " has played the cards:     " + playedCardList[0][reportProperty]);
		if(playedCardList.length!==0){
			this.played.push(playedCardList[0]);
			for(var i=1;i<playedCardList.length;i++){
				msgContent=msgContent + ",     " + playedCardList[i][reportProperty];
				this.played.push(playedCardList[i]);
			}
		}
        if(report){
		    this.cleaner.sendMessageToAllPlayers(this.name+"_played",msgContent);
        }
	}
	seeTopPlayed(report, reportProperty){
		if(this.played.length===0){return undefined;}
		var card=this.played[this.played.length-1];
        if(report){this.cleaner.sendMessageToAllPlayers(this.name+"_discard","The card at the top of the " + this.name + " play area is: **" + card[reportProperty] + "**");}
		return card;
	}
	discardCard(report, newCard, playerName, reportProperty){
		this.discard.push(newCard);
        if(report){
		    this.cleaner.sendMessageToAllPlayers(this.name+"_discard",playerName + " has discarded the card " + newCard[reportProperty]);
        }
	}
	seeTopDiscard(report,reportProperty){
		if(this.discard.length===0){return undefined;}
		var card=this.discard[this.discard.length-1];
        if(report){this.cleaner.sendMessageToAllPlayers(this.name+"_deck","The card at the top of the " + this.name + " discard pile is: **" + card[reportProperty] + "**");}
		return card;
	}
	displayEntirePlayed(reportProperty){
		if(this.played.length===0){
			this.cleaner.sendMessageToAllPlayers(this.name+"_deck",this.name+ " play area is empty");
			return;
		}
		var msgContent="**In the " + this.name + " play area: **";
        for(var i=0;i<this.played.length;i++){
            msgContent=msgContent +"   "+ this.played[i][reportProperty];
        }
		this.cleaner.sendMessageToAllPlayers(this.name+"_deck",msgContent);
	}
	discardPlayArea(report){
		if(this.played.length==0){
			if(report){this.cleaner.sendMessageToAllPlayers(this.name+"_deck",this.name+ " play area is empty");}
		} else{
			for(var i=this.played.length-1;i>=0;i--){
				this.discardCard(false, this.played[i],"play area");
				this.played.splice(i,1);
			}
			if(report){this.cleaner.sendMessageToAllPlayers(this.name+"_deck",this.name+ " play area has been discarded and is now empty");}
		}
	}
    displayEntireDiscard(reportProperty){
		if(this.discard.length===0){
			this.cleaner.sendMessageToAllPlayers(this.name+"_deck",this.name+ " discard pile is empty");
			return;
		}
		var msgContent="**In the " + this.name + " discard pile: **";
        for(var i=0;i<this.discard.length;i++){
            msgContent=msgContent +"   "+ this.discard[i][reportProperty];
        }
		this.cleaner.sendMessageToAllPlayers(this.name+"_deck",msgContent);
    }
}
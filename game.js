"use strict";
const randos= require('./randos.js');
const help= require('./help.js');
const Deck = require('./deck.js');
const Cleaner = require('./cleaner.js');
const Player = require('./player.js');
const Playdeck = require('./playdeck.js');

module.exports = class Game {
    constructor()
    {
        this.cleaner = new Cleaner("Slash");    this.test=0;    
        this.deck = undefined;      this.includeDescription=false;
        this.randodeck = new Deck("Rando", randos.makerandodeck(), this.cleaner, true);
        this.playarea = [];         this.judgecard=undefined;       this.players=[];
        this.groups=[];             this.randocount=0;              this.maxscore=10;
        this.gameinprogress=false;  this.prefix="//";               this.maxplayer=20;
        this.handsize=10;           this.currentplayer=undefined;   this.randoplayed=false;
        this.playWaiting=false;     this.guild=undefined;           this.newIndex=0;
        this.cleaner.addSentMessageTypeSingle("new");
        this.cleaner.addSentMessageTypePlayers("hand");
        this.cleaner.addSentMessageTypePlayers("instruct");
        this.cleaner.addSentMessageTypePlayers("judgecard");
        this.cleaner.addSentMessageTypePlayers("played");
        this.cleaner.addSentMessageTypePlayers("score");
        this.cleaner.addSentMessageTypePlayers("groups");
        this.cleaner.addSentMessageTypePlayers("winner");
    }
    messagehandler(msg,clientID)
    {
        if(msg.guild!==null&&(msg.content.toLowerCase().startsWith(this.prefix.toLowerCase())&&(msg.guild===this.guild||this.guild===undefined)) || this.cleaner.playerChannels.find(x=>x===msg.channel)){
            var msgcontent = (msg.content.toLowerCase().startsWith(this.prefix.toLowerCase()) ? msg.content.substring(this.prefix.length) : msg.content);
            var msgInfo=""; [msgcontent,msgInfo]=this.splitStr(msgcontent," ");
            switch(msgcontent.toLowerCase()){
                case 'newgame': case 'new': case 'start': case 'startgame': this.startgame(msg,clientID); break;
                case 'info': case 'help': this.helpmessage(msg); break;
                case 'groups': case 'group': case 'matched': case 'won': case 'grouped': this.showGroups(msg, false); break;
                case 'endgame': case 'end': this.endgame(msg, true); break;
                case 'cleanup': case 'clean': this.cleanup(msg, clientID); break;
                case 'join': this.joingame(msg); break;
                case 'leave': this.leavegame(msg); break;
                case 'addrand': case 'addrando': this.addrando(msg); break;
                case 'removerand': case 'removerando': this.removerando(msg); break;
                case 'disc': case 'dis': case 'discard': this.discardcard(msg, msgInfo); break;
                case 'play': case 'playcard': this.play(msg, msgInfo); break;
                case 'showplayed': case 'show': case 'played': this.showplayarea(msg); break;
                case 'skipplayer': case 'skip': this.nextplayer(msg, true); break;
                case 'selectwinner': case 'select': case 'choose': this.selectwinner(msg, msgInfo); break;
                case 'chat': case 'msg': this.sendChat(msg, msgInfo); break;
                case 'editfolder': case 'editcategory': case 'changefolder': case 'changecategory': case 'editparent': case 'changeparent': case 'setfolder': case 'setcategory': case 'setparent': this.setFolder(msg, msgInfo); break;
                case 'viewfolder': case 'viewcategory': case 'folder': case 'category': case 'parent': case 'viewparent': case 'getfolder': case 'getcategory': case 'getparent': this.viewFolder(msg, msgInfo); break;
                //case 'viewcards': this.viewcards(msg); break;
                default: if(!isNaN(Number(msgcontent))){
                    if(this.randoplayed){
                        this.selectwinner(msg, msgcontent + " " + msgInfo);
                    }else{
                        this.play(msg, msgcontent + " " + msgInfo);
                    }
                }
            }
        }   
     }
    splitStr(text,splChar){
        text=text.trim();       var text1=text; var text2="";   var spFind = text.indexOf(splChar);
        if(spFind !== -1){
            text2=text.substring(spFind+1).trim();            text1=text.substring(0,spFind);
        }
        return [text1, text2];
    }
    getAuthorName(msg){
        return msg.member===undefined ? msg.author.username : (msg.member.nickname===null ? msg.author.username : msg.member.nickname);
    }
    checks(msg, isRunning, isNotRunning, roundPlayed, roundNotPlayed, isPlayer, isNotPlayer, isCurrentPlayer, isNotCurrentPlayer){
        var checkResult=true;
        if(isRunning && !this.gameinprogress){checkResult=false; this.cleaner.sendReplyMessage(msg,"other","Error: can't run this command because there is no game running");}
        else if(isNotRunning && this.gameinprogress){checkResult=false; this.cleaner.sendReplyMessage(msg,"other","Error: can't run this command while the game is running");}
        else if(roundPlayed && !this.randoplayed){checkResult=false; this.cleaner.sendReplyMessage(msg,"other","Error: can't run this command while players are still playing cards");}
        else if(roundNotPlayed && this.randoplayed){checkResult=false; this.cleaner.sendReplyMessage(msg,"other","Error: can't run this command while the winner is being selected");}
        else if(isPlayer && !this.players.find(x=>x.id===msg.author.id)){checkResult=false;this.cleaner.sendReplyMessage(msg,"other","Error: you are not a player"); }
        else if(isNotPlayer && this.players.find(x=>x.id===msg.author.id)){checkResult=false;this.cleaner.sendReplyMessage(msg,"other","Error: you are already playing in this game"); }
        else if(isCurrentPlayer && this.currentplayer!==msg.author.id){checkResult=false;this.cleaner.sendReplyMessage(msg,"other","Error: it is not your turn to play"); }
        else if(isNotCurrentPlayer && this.currentplayer===msg.author.id){checkResult=false;this.cleaner.sendReplyMessage(msg,"other","Error: you cannot run this command as it is your turn to choose"); }
        return checkResult;
    }
    setFolder(msg, folderName){
        if(!this.checks(msg, false, true, false, false, false, false, false, false)){return;}
        if(folderName===""){this.cleaner.sendReplyMessage(msg,"other","Error: No category name given"); return;}
        this.cleaner.setFolder(msg, folderName);
    }
    viewFolder(msg){
        this.cleaner.sendReplyMessage(msg, "other", "Category for game channels is: " + this.cleaner.folderName + "\nEdit using command " + this.prefix + "editfolder");
    }
    async viewcards(msg){
        var cards = await Playdeck.makeplaydeck(msg, this.cleaner);
        for(var i=0;i<cards.length;i++){
            this.cleaner.sendPermanentReplyMessage(msg, "[**" + (i+1) + "**] : " + cards[i]["fulltext"]);
        }
    }
    async startgame(msg, clientID)
    {
        this.cleaner.receivedGeneralMessage("other",msg);
        if(!this.checks(msg, false, true, false, false, false, false, false, false)){return;}
        this.cleaner.setMainChannel(msg.channel, clientID);
        var cardList = await Playdeck.makeplaydeck(msg, this.cleaner);
        this.deck = new Deck("Slash",  cardList, this.cleaner, true);
        this.playarea = [];             this.judgecard=undefined;      this.players=[];
        this.groups=[];                 this.randocount=0;      this.gameinprogress=true;
        this.currentplayer=undefined;   this.randoplayed=false; this.guild=msg.guild;
        this.playWaiting=false;         this.newIndex=0;
        let botAdmin = process.env.BOT_ADMIN_NAME
        if (!botAdmin || botAdmin == "") {
            botAdmin = "your server moderator"
        }
        this.cleaner.sendReplyMessage(msg,"new","New game started. Type **" + this.prefix + "join** to play."
         + "\n*By joining, you agree to your username and nickname being stored on the bot's server for the "
         + "duration of the game, for the purposes of playing the game. If you have any concerns or requests "
         + "please contact the bot admin, " + botAdmin + "*");
    }
    async endgame(msg,checkEnd)
    {
        var that=this;
        if(checkEnd)
        {
            this.cleaner.receivedGeneralMessage("other",msg);
            if(!this.checks(msg, true, false, false, false, true, false, false, false)){return;}
            var checkResult = await this.cleaner.checkMessageGeneral(msg, msg.channel, msg.author.id, "Are you sure you want to end the game?", "Command cancelled");
            if(!checkResult){return;}
        }
        var topscorer= this.showscores(msg, false, true);
        this.cleaner.sendPermanentMessageToPlayers("Thank you for playing! The winner is " + topscorer);
        this.cleaner.sendGeneralPermanentMessage("Thank you for playing! The winner is " + topscorer);
        this.gameinprogress=false;
        this.showGroups(msg, true);
        setTimeout(()=> {that.cleaner.close()}, 30000);
    }
    async cleanup(msg, clientID)
    {
        this.cleaner.receivedGeneralMessage("other",msg);
        if(!this.checks(msg, false, true, false, false, false, false, false, false)){return;}
        
        // Find all the channels to delete
        let toDelete = await this.cleaner.cleanupSearch(msg, clientID)

        // Confirm that we want to delete them
        var toDeleteMsg = ""
        if (toDelete.length == 0) {
            msg.channel.send("No slash channels found")
            return
        }
        for (const entry of toDelete) {
            toDeleteMsg = toDeleteMsg + "\n" + entry[1]
        }
        let ok = await this.cleaner.checkMessageGeneral(msg, msg.channel, msg.author.id, "Delete the following " + toDelete.length + " channel(s)?" + toDeleteMsg + "\n", "Command cancelled")
        if (ok == false) {
            return
        }

        // Delete them
        let ids = []
        for (const entry of toDelete) {
            ids.push(entry[0])
        }

        await this.cleaner.deleteChannels(ids)
    }
    showscores(msg, recordMsg, sendPermanent)
    {
        if(recordMsg){this.cleaner.receivedGeneralMessage("other",msg);}
        var scoremsg="";
        if (this.players.length===0){ scoremsg="There are no players"}
        else{
            var topscore=this.players[0].score;         var topscorer=this.players[0].name;
            scoremsg=topscorer + " " + topscore;
            for (var i = 1; i < this.players.length; i++) {
                scoremsg = scoremsg + "\n" +  this.players[i].name + "    " + this.players[i].score;
                if(this.players[i].score>topscore) {
                    topscore=this.players[i].score;  topscorer=this.players[i].name;
                }else if (this.players[i].score===topscore){
                    topscorer = topscorer + " and " + this.players[i].name;
                }
            }
        }
        if(recordMsg){this.cleaner.sendReplyMessage(msg, "other",scoremsg);}
        else{this.cleaner.sendMessageToAllPlayers("score",scoremsg);}
        if(sendPermanent){this.cleaner.sendGeneralPermanentMessage(scoremsg);}
        return topscorer;
    }
    showGroups(msg, endGame)
    {
        if(!endGame){this.cleaner.receivedGeneralMessage("other",msg);}
        var msgcontent="";
        if(this.groups.length===0) {msgcontent="There are no emotionally bonded groups as you haven't played any rounds yet";}
        else{
            msgcontent=("During this game, the following groups became emotionally bonded partners:")
            for(var i=0;i<this.groups.length;i++){
                var groupItem = this.groups[i];
                msgcontent = msgcontent + "\n" + (i+1) + "\t" + groupItem[0];
                for(var j=1;j<groupItem.length;j++){
                    msgcontent = msgcontent + ", " + groupItem[j];
                }
            }
        }
        var player=this.players.find(x => x.id===msg.author.id);
        if(endGame){
            this.cleaner.sendPermanentMessageToPlayers(msgcontent);
            this.cleaner.sendGeneralPermanentMessage(msgcontent);
        }
        else if(player===undefined){this.cleaner.sendReplyMessage(msg, "other", msgcontent);}
        else{this.cleaner.sendMessageToSinglePlayer(player.index, "groups", msgcontent);}
    }
    async joingame(msg)
    {
        this.cleaner.receivedGeneralMessage("other",msg);
        if(!this.checks(msg, true, false, false, true, false, true, false, false )){return;}
        if(this.players.length>=this.maxplayer){
            this.cleaner.sendReplyMessage(msg, "other","Sorry, there are too many players");
            return;
        }
        var playerItem = new Player(msg.author.id, this.getAuthorName(msg), this.cleaner, this.newIndex, false, this.includeDescription );
        var firstPlayerName;
        if(!this.players.find(x=>!x.isRando)){this.currentplayer=msg.author.id; firstPlayerName=playerItem.name;}
        else{firstPlayerName=this.players.find(x=>x.id===this.currentplayer).name;}
        this.players.push(playerItem);
        await this.cleaner.addPlayerChannel(msg, playerItem.name, playerItem.index, playerItem.id);
        playerItem.startRound(this.deck, this.handsize, firstPlayerName, this.prefix, this.playWaiting, this.judgecard ? this.judgecard.fulltext : "");
        this.newIndex=this.newIndex+1;
        this.cleaner.sendMessageToAllPlayers("other",playerItem.name + " has joined the game");
    }
    leavegame(msg)
    {
        this.cleaner.receivedGeneralMessage("other",msg);
        if(!this.checks(msg, true, false, false, true, true, false, false, true)){return;}
        var playerPosition = this.players.findIndex(x=>x.id===msg.author.id);
        var playerItem=this.players[playerPosition];
        this.players.splice(playerPosition,1);
        playerItem.hand.discardAll(this.deck, false, playerItem.name, this.cleaner, "smalltext");
        this.cleaner.removePlayer(playerItem.index);
        this.cleaner.sendMessageToAllPlayers("other", playerItem.name + " has left the game");
    }
    nextplayer(msg, recordMsg)
    {
        if(recordMsg){
            this.cleaner.receivedGeneralMessage("other",msg);
            if(!this.checks(msg, true, false, false, true, true, false, false, false)){return;}
        }
        if(this.players.length===this.randocount){return; }
        var playerPosition=this.players.findIndex(x=>x.id===this.currentplayer);
        var startPosition=playerPosition;
        playerPosition = playerPosition === this.players.length-1 ? 0 : playerPosition+1;
        while(this.players[playerPosition].isRando && playerPosition!==startPosition){
            playerPosition = playerPosition === this.players.length-1 ? 0 : playerPosition+1;
        }
        var playerItem=this.players[playerPosition];
        this.currentplayer=playerItem.id;
        this.cleaner.sendMessageToAllPlayers("instruct", playerItem.name + " will play the character seeking matches for emotionally bonded partnerships by entering the number of a card from their hand.\nThe other players will then select a card or group of cards, entering numbers in one command separated by spaces.\n" + playerItem.name + " will then view the cards with the command **" + this.prefix + "show**, and select the winning group for this round.\n*Optional Hard Mode: " + playerItem.name + " will give a story prompt that the players will have to answer when the cards are revealed; e.g. 'Tell me how they met'*");       
    } 
    addrando(msg)
    {
        this.cleaner.receivedGeneralMessage("other",msg);
        if(!this.checks(msg, true, false, false, true, true, false, false, false )){return;}
        if(this.players.length>=this.maxplayer){this.cleaner.sendReplyMessage(msg, "other", "There are too many players"); return; }
        this.randocount++;
        var randoName = this.randodeck.draw(false, "Rando").fulltext;
        this.players.push(new Player(-1, randoName, this.cleaner, -1, true));
        this.cleaner.sendMessageToAllPlayers("other","Rando player " + randoName +" added to the game");
    }
    removerando(msg)
    {
        this.cleaner.receivedGeneralMessage("other",msg);
        if(!this.checks(msg, true, false, false, true, true, false, false, false )){return;}
        if(this.randocount==0) {this.cleaner.sendReplyMessage(msg, "other", "No random players to remove"); return;}
        var randoPosition=this.players.findIndex(x => x.isRando);
        var randoName = this.players[randoPosition].name;
        this.players.splice(randoPosition,1);
        this.randodeck.discardCard(false, {fulltext: randoName}, randoName, "fulltext");
        this.cleaner.sendMessageToAllPlayers("other","Rando player " + randoName +" removed from the game");
        this.randocount--;
    }
    showjudgecard(msg)
    {
        if(this.judgecard===undefined) {this.cleaner.sendReplyMessage(msg, "other","The character seeking emotionally bonded partners has not yet been selected");}
        else{this.cleaner.sendMessageToAllPlayers("judgecard","This round you are looking for matches for: \n **" + this.judgecard.fulltext.replaceAll("**","") + "**");}
        this.cleaner.sendMessageToAllPlayers("instruct","Select a card or group of cards, entering numbers in one command separated by spaces.\n" + this.players.find(x=>x.id===this.currentplayer).name + " will then view the cards with the command **" + this.prefix + "show**, and select the winning group for this round.");
    }
    discardcard(msg, msginstruct)
    {
        var playerItem;
        if(this.checks(msg, true, false, false, false, true, false, false, false)){
            playerItem=this.players.find(x=>x.id===msg.author.id);
            this.cleaner.receivedMessageFromSinglePlayer("other", msg, playerItem.index);
        }else{
            this.cleaner.receivedGeneralMessage("other",msg);
            return
        }
        if(this.playWaiting && msg.author.id!==this.currentplayer && this.playarea.findIndex(x=>x.authorID===msg.author.id)===-1){
            this.cleaner.sendReplyMessage(msg, "other", "You cannot discard cards until you've played your cards for this turn"); return;
        } 
        if(!this.playWaiting && msg.author.id===this.currentplayer){
            this.cleaner.sendReplyMessage(msg, "other", "You cannot discard cards until you've selected the match card for this round"); return;
        }
        playerItem.discardCards(msg, this.deck, msginstruct);
    }   
    play(msg, msginstruct)
    {
        var playerItem;
        if(this.checks(msg, true, false, false, true, true, false, false, false)){
            playerItem=this.players.find(x=>x.id===msg.author.id);
            this.cleaner.receivedMessageFromSinglePlayer("other", msg, playerItem.index);
        }else{
            this.cleaner.receivedGeneralMessage("other",msg);
            return
        }
        if(!this.playWaiting){
            if(msg.author.id!==this.currentplayer){
                this.cleaner.sendReplyMessage(msg, "other","You can't play a card yet, the current player has not selected a match"); return;
            }
            var card=playerItem.playCards(msg, msginstruct, true, this.deck);
            if(!card){return;}
            this.judgecard=card;
            this.showjudgecard(msg);
            this.playWaiting=true;
        }else{
            if(msg.author.id===this.currentplayer){
                this.cleaner.sendReplyMessage(msg, "other","You can't play a card yet, you are the current player! type " + this.prefix + "show to see played cards when other players have finished playing, then select the winning match"); return;
            }
            if(this.playarea.find(x=>x.authorID===msg.author.id)){this.cleaner.sendReplyMessage(msg, "other","You cannot play another card, you have already played this turn"); return;}
            var cards=playerItem.playCards(msg, msginstruct, false, this.deck);
            this.playarea.push(new PlayCardItem(playerItem.id, playerItem.name, cards));
            this.cleaner.sendMessageToAllPlayersFromSinglePlayer(playerItem.index, playerItem.name + " has played their cards.");
            if(this.playarea.length===this.players.length-this.randocount-1){this.cleaner.sendMessageToAllPlayers("played", "All players have now played their cards.");}
        }
    }   
    async showplayarea(msg)
    {
        var playerItem;
        if(this.checks(msg, true, false, false, true, true, false, true, false)){
            if(this.players.length<=1 || (this.playarea.length==0 && this.randocount==0)){
                this.cleaner.receivedGeneralMessage("other",msg);
                this.cleaner.sendReplyMessage(msg,"other","Error: There are no cards to view in the played area");
                return
            }
            playerItem=this.players.find(x=>x.id===msg.author.id);
            this.cleaner.receivedMessageFromSinglePlayer("other", msg, playerItem.index);
        }else{
            this.cleaner.receivedGeneralMessage("other",msg);
            return
        }
        if(!this.playWaiting){this.cleaner.sendReplyMessage(msg, "other","You have not yet selected a card to match for"); return;}
        this.playWaiting=false;
        this.roundPlayed=true;
        if(this.playarea.length>=this.players.length-this.randocount){
            var checkResult = await this.cleaner.checkMessageGeneral(msg, msg.channel, msg.author.id, "Are you sure you want to display the cards? If anyone hasn't played yet they won't be able to play after the cards have been revealed.", "Command cancelled");
            if(!checkResult){return;}
        }
        this.playrandos();
    }
    playrandos()
    {
        for(var i=0; i<this.players.length;i++)
        {
            var playItem = this.players[i];
            if(playItem.isRando){
                var cards=playItem.playRando(this.deck);
                this.playarea.push(new PlayCardItem(playItem.id, playItem.name,cards));
            }
        }
        this.randoplayed=true;
        this.shuffle(this.playarea);
        this.showplayareado();
    }
    showplayareado()
    {
        var msgcontent=this.judgecard.fulltext + " is seeking an emotionally close relationship with:";
        for(var i=0;i<this.playarea.length;i++){
            var playCards=this.playarea[i].cards;
            msgcontent = msgcontent + "\n[" + (i+1) + "]  " + this.playarea[i].name + ": \t" + playCards[0].smalltext;
            for(var j=1;j<playCards.length;j++){
                msgcontent = msgcontent + ", " + playCards[j].smalltext;
            }
        }
        this.cleaner.sendPermanentMessageToPlayers(msgcontent);
        msgcontent = "If the players choose, they can take the chance to explain why a particular grouping would be a good match. You might want to describe things like: how the character dynamics work; what their first date was like; what they most appreciate about each other."
        msgcontent = msgcontent + "\nWhen you are ready, " + this.players.find(x=>x.id===this.currentplayer).name + " will select the winning group."
        this.cleaner.sendMessageToAllPlayers("played",msgcontent);
    }
    selectwinner(msg, msginstruct)
    {
        if(!this.checks(msg, true, false, true, false, true, false, true, false)){this.cleaner.receivedGeneralMessage("other",msg); return;}
        var playinstruct = Number(msginstruct);
        if (Number.isNaN(playinstruct) || playinstruct<1 || playinstruct>this.playarea.length){
            this.cleaner.receivedGeneralMessage("other",msg);
            this.cleaner.sendReplyMessage(msg, "other", "Error: This is an invalid selection");
            return;
        }
        this.cleaner.receivedMessageFromSinglePlayer("other", msg, this.players.find(x=>x.id===msg.author.id).index);
        var chosenCard=this.playarea[playinstruct-1];   var groupItem=[];
        var newGroupItem = this.judgecard.fulltext.substring(0,this.judgecard.fulltext.indexOf('(')-1);
        groupItem.push(newGroupItem);
        var msgcontent = "The winner was " + chosenCard.name + " with the group : \t" + newGroupItem;
        var newScore=0;
        for(var i=0;i<chosenCard.cards.length;i++)
        {
            var newGroupItem = chosenCard.cards[i].fulltext.substring(0,chosenCard.cards[i].fulltext.indexOf('(')-1);
            msgcontent = msgcontent + ", " + newGroupItem;
            groupItem.push(newGroupItem);
            newScore = newScore + chosenCard.cards[i].score;
        }
        this.groups.push(groupItem);
        this.cleaner.sendPermanentMessageToPlayers(msgcontent);
        var playerItem = chosenCard.authorID===-1 ? this.players.find(x=>x.name===chosenCard.name && x.id===-1) : this.players.find(x=>x.id===chosenCard.authorID);
        playerItem.score = playerItem.score + newScore;
        playerItem.addWin(this.judgecard.fulltext.substring(0,this.judgecard.fulltext.indexOf(')')-1))

        if(playerItem.score>=this.maxscore) {this.endgame(msg,false); return;}
        for(var i=0;i<this.playarea.length;i++){
            for(var j=0;j<this.playarea[i].cards.length;j++)
            {
                this.deck.discardCard(false, this.playarea[i].cards[j], "played", "smalltext");
            }
        }
        this.deck.discardCard(false, this.judgecard, "played", "smalltext");
        this.playarea=[];
        this.judgecard=undefined;
        this.randoplayed=false;
        this.playWaiting=false;
        this.roundplayed=false;
        this.showscores(msg, false, false);
        for(var i=0;i<this.players.length;i++){
            if(!this.players[i].isRando){this.players[i].showCards();}
        }
        this.nextplayer(msg, false);
    }
    shuffle(carddeck)
    {
        if(carddeck.lenth===0) {return;}
        var i;
        for (i = carddeck.length - 1; i > 0; i--) 
        {
            let j = Math.floor(Math.random() * (i + 1));
            [carddeck[i], carddeck[j]] = [carddeck[j], carddeck[i]];
        }
    }
    helpmessage(msg)
    {
        this.cleaner.receivedGeneralMessage("other", msg);
        this.cleaner.sendPermanentReplyMessage(msg, help.makeHelpText1(this.prefix, this.maxscore));
    }
    sendChat(msg, msgContent){
        this.cleaner.receivedGeneralMessage("other",msg);
        var findPlayer=this.players.findIndex(x=>x.id===msg.author.id); 
        var fromName=findPlayer!==-1 ? this.players[findPlayer].name : this.getAuthorName(msg);
        this.cleaner.sendPermanentMessageToPlayers("**"+fromName+"**:   " + msgContent);
    }
}


class PlayCardItem
{ 
    constructor(setAuthor, setName, setCards)
    {
        this.authorID=setAuthor;
        this.name=setName;
        this.cards=setCards;
    }  
}

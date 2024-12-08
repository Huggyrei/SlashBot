"use strict";
import { readFileSync, writeFileSync } from 'fs';
import Discord, { ChannelType, PermissionFlagsBits } from 'discord.js';

export default class Cleaner{
    constructor(gameName){
        this. gameName=gameName;        this.msgCollected=false;    this.msgReturn=false;
        this.mainChannel=undefined;     this.playerChannels=[];     this.guild=undefined;           
        this.clientID=undefined;        this.receiveMsgs=[];        this.receiveMsgsByPlayer=[];  
        this.sentMsgs=[];               this.sentMsgsByPlayer=[];   this.sentMsgsByPlayerByPlayer=[]; 
        this.sentMsgsByPlayerByAI=[];   this.folderName="";
        this.sentMsgs.push([{name: "other", message: undefined}]);
        this.receiveMsgs.push([{name: "other", message: undefined}]);
        this.sentMsgsByPlayer.push({name: "other", messageList: []});
        this.receiveMsgsByPlayer.push({name: "other", messageList: []});
        this.loadFolder();
    }
    loadFolder(){
        try{            
            this.folderName = readFileSync("./folder.csv", 'utf8'); 
        }
        catch{this.folderName="";}
    }
    setFolder(msg, folderName){
        this.folderName=folderName;
        try{            
            writeFileSync("./folder.csv", this.folderName); 
            this.sendReplyMessage(msg, "other", "Category folder has been successfully changed");
        }
        catch{this.sendReplyMessage(msg, "other","Error: Cannot save new category name, you may need to re-set this again the next time the bot reloads.");}
    }
    async close(){
        for(var i=0;i<this.playerChannels.length;i++){
            if(this.playerChannels[i]!==undefined && this.playerChannels[i].deletable==true){
                try{await this.playerChannels[i].delete();}catch(err){console.log(err)}
            }
        }
        this.playerChannels=[];
        for(var i=0;i<this.receiveMsgsByPlayer.length;i++){
            this.receiveMsgsByPlayer[i].messageList=[];
        }
        for(var i=0;i<this.sentMsgsByPlayer.length;i++){
            this.sentMsgsByPlayer[i].messageList=[];
        }
        for(var i=0;i<this.receiveMsgs.length;i++){
            this.resetMessage(this.receiveMsgs[i]);
        }
        for(var i=0;i<this.sentMsgs.length;i++){
            this.resetMessage(this.sentMsgs[i]);
        }
        this.sentMsgsByPlayerByPlayer=[];
        this.sentMsgsByPlayerByAI=[];
        this.mainchannel=undefined;
    }
    setMainChannel(msg, clientID){
        this.guild=msg.guild;   this.mainChannel=msg.channel;   this.clientID=clientID
    }
    async cleanupSearch(msg, clientID) {
        if (this.guild === undefined) {
            this.setMainChannel(msg, clientID)
        }

        return this.guild.channels.fetch()
        .then(channels => {
            var toClean = []
            var parentId = ""
            // Find the category which holds our channels
            for (const entry of channels) {
                if (entry[1].name == this.folderName) {
                    parentId = entry[0]
                }
            }
            // Find the channels to delete
            for (const entry of channels) {
                if (entry[1].parent == parentId && entry[1].name.startsWith("slash_")) {
                    toClean.push([entry[0], entry[1].name])
                }
            }
            
            return toClean
        })
    }
    async deleteChannels(ids) {
        if (this.guild === undefined) {
            this.setMainChannel(msg, clientID)
        }

        for (const id of ids) {
            await this.guild.channels.fetch(id)
            .then(channel => {
                 return channel.delete("Cleaning up slash channels") 
                })
        }
    }
    async addPlayerChannel(msg, playerName,playerIndex,playerID){ 
        if(this.mainChannel===undefined){this.mainChannel=msg.channel;}
        var permArr = [{id: playerID, allow: [PermissionFlagsBits.ViewChannel],}];
        permArr.push({id: this.guild.id, deny: [PermissionFlagsBits.ViewChannel],});
        permArr.push({id: this.clientID, allow: [PermissionFlagsBits.ViewChannel],});
        var parObj=undefined;
        if(this.folderName!==""){

            parObj = (await this.guild.channels.fetch()).find(x=>x.name.toLowerCase()===this.folderName.toLowerCase() && x.type===ChannelType.GuildCategory);
            if(parObj===undefined){
                try{
                    parObj = await this.guild.channels.create({name: this.folderName, type: ChannelType.GuildCategory});
                }catch(err){console.log(err)}
            }
        }
        var inputs = parObj===undefined ? {name: this.gameName + '_' + playerName, type: ChannelType.GuildText, permissionOverwrites: permArr,} : {name: this.gameName + '_' + playerName, type: ChannelType.GuildText, permissionOverwrites: permArr, parent: parObj} 
        try{
            await this.guild.channels.create(inputs)
            .then(newChannel=>{
                this.thenAddPlayer(msg, newChannel,playerIndex);
            });
            return true;
        }catch(err){console.log(err); return false;};
    }
    thenAddPlayer(msg, newChannel, playerIndex){
        if(this.playerChannels.length<=playerIndex){
            var newCount=playerIndex-this.playerChannels.length+1;
            for(var i=0;i<this.sentMsgsByPlayerByPlayer.length;i++){
                for(var j=0;j<newCount;j++){
                    this.sentMsgsByPlayerByPlayer[i].messageList.push(undefined);
                }
            }
            for(var i=0;i<newCount;i++){
                this.playerChannels.push(undefined);
                for(var j=0;j<this.receiveMsgsByPlayer.length;j++){
                    this.receiveMsgsByPlayer[j].messageList.push(undefined);
                }
                for(var j=0;j<this.sentMsgsByPlayer.length;j++){
                    this.sentMsgsByPlayer[j].messageList.push(undefined);
                }
                this.sentMsgsByPlayerByPlayer.push({index: playerIndex-newCount+i+1, messageList: new Array(playerIndex+1).fill(undefined)})
                for(var j=0;j<this.sentMsgsByPlayerByAI.length;j++){
                    this.sentMsgsByPlayerByAI[j].messageList.push(undefined);
                }
            }
        }
        this.playerChannels[playerIndex]=newChannel;
        this.sendMessageToSinglePlayer(playerIndex,"other", "Private channel created, please play in here"); 
        this.sendReplyMessage(msg, "other","You have joined the game. A private channel has been created for you to play in.")
    }
    async removePlayer(playerIndex){ 
        if(this.playerChannels[playerIndex]!==undefined && this.playerChannels[playerIndex].deletable==true){
            try{await this.playerChannels[playerIndex].delete();}catch(err){console.log(err);}
        }
        this.playerChannels[playerIndex]=undefined;
    }
    addAIPlayer(){
        this.sentMsgsByPlayerByAI.push({index: this.sentMsgsByPlayerByAI.length, messageList: new Array(this.playerChannels.length).fill(undefined)});
    }
    addSentMessageTypeSingle(typeName){
        this.sentMsgs.push({name: typeName, message: undefined});
    }
    addSentMessageTypePlayers(typeName){
        var newList = [];
        for(var i=0;i<this.playerChannels.length;i++){
            newList.push(undefined);
        }
        this.sentMsgsByPlayer.push({name: typeName, messageList: newList});
    }
    addReceiveMessageTypeSingle(typeName){
        this.receiveMsgs.push({name: typeName, message: undefined});
    }
    addReceiveMessageTypePlayers(typeName){
        var newList = [];
        for(var i=0;i<this.playerChannels.length;i++){
            newList.push(undefined);
        }
        this.sentMsgsByPlayer.push({name: typeName, messageList: newList});
    }
    async resetMessage(msgList){
        if(msgList==undefined){return [];}
        if(!Array.isArray(msgList)){msgList = [msgList];}
        for(var i=0;i<msgList.length;i++){
            var msgObj = msgList[i];
            if(msgObj!==undefined){
                await Promise.resolve(msgObj).then(async msg=>{
                    if(msg.deletable===true){
                        try{await msg.delete();}
                        catch{
                            await this.wait(100);
                            try{await msg.delete();}catch(err){console.log(err);}
                        }
                    }
                });
            }
        }
        return [];
    }
    async sendReplyMessage(receiveMsg, msgType, msgContent){
        var msgObj = this.sentMsgs.find(x=>x.name===msgType);
        if(msgObj===undefined){msgObj=this.sentMsgs[0];}
        await this.resetMessage(msgObj.message);
        msgObj.message = await this.privateReplyToMessage(receiveMsg, msgContent);
        
    }
    async sendPermanentReplyMessage(receiveMsg,msgContent){
        await  this.privateReplyToMessage(receiveMsg, msgContent);
    }
    async sendGeneralMessage(msgType, msgContent){
        var msgObj = this.sentMsgs.find(x=>x.name===msgType);
        if(msgObj===undefined){msgObj=this.sentMsgs[0];}
        await this.resetMessage(msgObj.message);
        msgObj.message = await this.privateMessageToChannel(this.mainChannel, msgContent);
    }
    async sendMessageToAllPlayers(msgType, msgContent){
        var msgObj = this.sentMsgsByPlayer.find(x=>x.name===msgType);
        if(msgObj===undefined){msgObj=this.sentMsgsByPlayer[0];}
        for(var i=0;i<msgObj.messageList.length;i++){
            await this.resetMessage(msgObj.messageList[i]);
            if(this.playerChannels[i]!==undefined){
                msgObj.messageList[i] = await this.privateMessageToChannel(this.playerChannels[i], msgContent);
            }
        }
    }
    async sendMessageToSinglePlayer(playerIndex, msgType, msgContent){
        var msgObj = this.sentMsgsByPlayer.find(x=>x.name===msgType);
        if(msgObj===undefined){msgObj=this.sentMsgsByPlayer[0];}
        await this.resetMessage(msgObj.messageList[playerIndex]);
        if(this.playerChannels[playerIndex]!==undefined){
            msgObj.messageList[playerIndex]=await this.privateMessageToChannel(this.playerChannels[playerIndex], msgContent);
        }
    }
    async receivedGeneralMessage(msgType, receivedMessage){
        var msgObj = this.receiveMsgs.find(x=>x.name===msgType);
        if(msgObj===undefined){msgObj=this.receiveMsgs[0];}
        await this.resetMessage(msgObj.message);
        msgObj.message=[receivedMessage];
    }
    async receivedMessageFromSinglePlayer(msgType, receivedMessage, playerIndex){
        var msgObj = this.receiveMsgsByPlayer.find(x=>x.name===msgType);
        if(msgObj===undefined){msgObj=this.receiveMsgsByPlayer[0];}
        await this.resetMessage(msgObj.messageList[playerIndex]);
        msgObj.messageList[playerIndex]=[receivedMessage];
    }
    async sendGeneralPermanentMessage(msgContent){
        await this.privateMessageToChannel(this.mainChannel, msgContent);
    }
    async sendPermanentMessageToPlayers(msgContent){
        for(var i=0;i<this.playerChannels.length;i++){
            if(this.playerChannels[i]!==undefined){
                await this.privateMessageToChannel(this.playerChannels[i],msgContent);
            }
        }
    }
    async sendMessageToAllPlayersFromSinglePlayer(playerIndex, msgContent){
        var msgObj = this.sentMsgsByPlayerByPlayer[playerIndex];
        for(var i=0;i<msgObj.messageList.length;i++){
            await this.resetMessage(msgObj.messageList[i]);
            if(this.playerChannels[i]!==undefined){
                msgObj.messageList[i]=await this.privateMessageToChannel(this.playerChannels[i],msgContent);
            }
        }   
    }
    async sendMessageToAllPlayersFromAI(aiIndex, msgContent){
        var msgObj = this.sentMsgsByPlayerByAI[aiIndex];
        for(var i=0;i<msgObj.messageList.length;i++){
            await this.resetMessage(msgObj.messageList[i]);
            if(this.playerChannels[i]!==undefined){
                msgObj.messageList[i]=await this.privateMessageToChannel(this.playerChannels[i],msgContent);
            }
        }        
    }
    async checkMessageSinglePlayer(playerIndex, checkContent, cancelContent){
        checkContent = checkContent + " Enter y to continue or anything else to cancel";
        this.msgCollected=false;    this.msgReturn=false;   var checkMsg;
        if(this.playerChannels[playerIndex]===undefined){return false;}
        try{checkMsg=await this.playerChannels[playerIndex].send(checkContent);}
        catch{ 
            await this.wait(250);
            try{
                checkMsg =await this.playerChannels[playerIndex].send(checkContent);
            }catch{checkMsg=undefined;}
        }
        if(checkMsg==undefined){return false;}
        try{var collection=await this.playerChannels[playerIndex].awaitMessages({filter: m=>true, max: 1, time: 30000, errors: ['time'] });
            var msgReply=collection.first();
            if(!this.msgCollected){
                this.msgCollected=true;
                if (msgReply.content.toLowerCase().trim() ==="y") {this.msgReturn=true;}
                else{this.sendMessageToSinglePlayer(playerIndex, "other", cancelContent);}
            }
            if(msgReply.deletable===true){
                try{await setTimeout(async ()=> {try{await msgReply.delete();}catch(err){console.log(err);}}, 5000);}catch(err2){console.log(err2);}
            }
        }
        catch{if(!this.msgCollected){this.sendMessageToSinglePlayer(playerIndex, "other", cancelContent); this.msgCollected=true;}}
        return this.msgReturn;   
    }
    async checkMessageGeneral(msg, msgChannel, msgAuthorID, checkContent, cancelContent){
        checkContent = checkContent + " Enter y to continue or anything else to cancel";
        this.msgCollected=false;    this.msgReturn=false;   var checkMsg;
        try{checkMsg=await msgChannel.send(checkContent);}
        catch{
            try{ 
                await this.wait(250);
                checkMsg = await msgChannel.send(checkContent);
            }catch(err){console.log(err); checkMsg=undefined;}
        }
        if(checkMsg==undefined){return false;}
        try{var collection=await msgChannel.awaitMessages({filter: m =>m.author.id===msgAuthorID, max: 1, time: 30000, errors: ['time'] });
            var msgReply=collection.first();
            if(!this.msgCollected){
                this.msgCollected=true;
                if (msgReply.content.toLowerCase().trim() ==="y") {this.msgReturn=true;}
                else{this.sendReplyMessage(msg, "other", cancelContent);}
            }
            if(msgReply.deletable===true){
                try{await setTimeout(async (msgReply)=> {try{await msgReply.delete();}catch(err){console.log(err);}}, 5000);}catch(err2){console.log(err2);}
            }
        }
        catch{if(!this.msgCollected){this.sendReplyMessage(msg, "other", cancelContent); this.msgCollected=true;}}
        try{await setTimeout(async (checkMsg)=> {try{await checkMsg.delete();}catch(err){console.log(err);}}, 5000);}catch(err2){console.log(err2);}
        return this.msgReturn;   
    }
    async privateMessageToChannel(channel, content){
        var msgList=[];
        while(content.length>1970){
            var content2=""; [content2,content]=this.SplitMessage(content);
            msgList=msgList.concat(await this.privateMessageToChannel(channel, content2));
            await this.wait(250);
        }
        var newMsg=undefined;
        try{newMsg=await channel.send(content);}
        catch{
            await this.wait(250);
            try{
                newMsg = await channel.send(content);
            }catch(err){console.log(err); newMsg=undefined;}
        }
        if(newMsg!==undefined){msgList.push(newMsg);}
        return msgList;
    }
    async  privateReplyToMessage(msg, content){
        var msgList=[];
        while(content.length>1970){
            var content2=""; [content2,content]=this.SplitMessage(content);
            msgList=msgList.concat(await this.privateReplyToMessage(msg, content2));
            await this.wait(250);
        }
        var newMsg=undefined;
        try{newMsg=await msg.reply(content);}
        catch{
            await this.wait(250);
            try{
                newMsg = await msg.reply(content);
            }catch(err){console.log(err); newMsg=undefined;}
        }
        if(newMsg!==undefined){msgList.push(newMsg);}
        return msgList;
    }
    SplitMessage(content){
        content=content.trim();     var txtSplit1="";   var txtSplit2=content;
        var spFind = txtSplit2.indexOf("\n");
        if(spFind !== -1 && spFind+2<=1970){
            while(txtSplit1.length+spFind+2<=1970 || txtSplit1===""){
                txtSplit1=(txtSplit1!=="" ? txtSplit1+"\n" :"") + txtSplit2.substring(0, spFind);  
                var txtSplit2=txtSplit2.substring(spFind+1);
                spFind=txtSplit2.indexOf("\n");
            }
        }else{
            var spFind = txtSplit2.indexOf(" ");
            if(spFind !== -1 && spFind+1<=1970){
                while(txtSplit1.length+spFind+1<=1970 || txtSplit1===""){
                    txtSplit1=(txtSplit1!=="" ? txtSplit1+" " :"") + txtSplit2.substring(0, spFind);  
                    var txtSplit2=txtSplit2.substring(spFind);
                    spFind=txtSplit2.indexOf(" ");
                }
            }else{
                txtSplit1=content.substring(0,1970);
                txtSplit2=content.substring(1971);
            }
        }
        return [txtSplit1, txtSplit2];
    }
    async wait(ms) {
        return new Promise(resolve => {
          setTimeout(resolve, ms);
        });
    }
}

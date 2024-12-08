# SlashBot
This code repository is for running a Discord bot for playing "Slash: Romance Without Boundaries£, a game created by 'Games by Play Date' https://www.facebook.com/gamesbyplaydate/ under a Creative Commons Attribution-NonCommercial-ShareAlike license (which this code also uses).

Like a lot of fanfiction, this is a game about matching up characters - often from completely different genres - to create emotionally bonded partnerships. In this version, relationships may be romantic, sexual, QPRs, mentorships, band-of-siblings, or any other kind of important life partnerships. This version also allows you to play multiple cards at once to create a polycule.

Each round, the current player selects a character from their hand who will be matched. The other players select one or more cards from their hand that they think would form the best emotionally bonded partnership. 

Once everyone has chosen, the cards are revealed, and the players may argue their case before the current player selects the winning group. The winner gains points equal to the points on the cards they played. The more cards played, the more points - but you must justify the whole group dynamic! 

Players may drift in and out. You can join or leave, or just skip a few rounds.

The code base contains the original cards from Slash. However, you may also add your own custom made cards in a csv file called 'cards.csv'. This file begins with a list of suggested cards added by Huggyrei.

_Note: the bot is intended for use in only a single server at any given time. Any messages from a server it hasn't been currently setup for will be ignored. Access a list of functions and summary of the game rules with the command //help._


## Creating a Bot
If you want to use this code for your game, you will need to create your own bot application. You will need to take the following steps:
1. Copy this code repository into the folder you want to run it from
2. Go to https://discord.com/developers/applications
3. Click on 'New Application' in thr top right of the Applicatipns list
4. Name it and set the icon for your bot. There's a Slash.png file in the repository you can use for this.
5. In your new application, go to the 'Bot' section and click 'Add Bot'. Click the button to confirm that you want to create a bot.
6. Click on 'Click to Reveal Token' and then copy this. **WARNING**: DO NOT SHARE THIS TOKEN WITH ANYONE ELSE; it could be used to hack into your bot. 
7. Go to the folder with the code and open Index.js (you can do this in notepad)
8. At the bottom of the file is the line `let token = process.env.LOGIN_TOKEN`. Replace this with `let token = "YOUR_TOKEN" where YOUR_TOKEN is bot's token you've just copied (keep the quote marks around it!). Save the file. Alternatively, set the token as the environment variable LOGIN_TOKEN.
9. You need some way to install the Javascript libraries; I suggest installing Node from https://nodejs.org/en/download/.  You can then open a Node command prompt and enter "cd [folder address]" with the address of your new folder containing the bot code. This should navigate the command prompt to your folder. You should then enter the command 'npm install' to set up the libraries.


## Running the Bot
Now that you have a bot, you need to know how to set it running.
1. The first step is to invite the bot to your game server, if this is the first time you're running the bot on this server. Go to the discord developers applications page again and double-click on the bot's icon to bring up the setings. 
2. Under '0Auth2', go to the URL Generator, and click 'bot'. Underneath this, you will see a new list of permissions; select 'Manage Roles', 'Manage Channels', 'Read Messages/View Channels', 'Send Messages', and 'Manage Messages'.
3. This will cause a URL to be generated under the 'permissions' section. Copy that URL and enter it into a web browser to invite the bot into your server. Make sure you've selected the permissions first as in the previous step, otherwise your bot won't be able to do its job!
4. Now you just need some way to run the code whenever you want the bot to be working. If you already installed Node earlier, you can use this. Open a Node command prompt and enter "cd [folder address]" with the address of your new folder containing the bot code. Finally, enter the command 'Node Index' to run the Index file.
5. You can also run the bot in docker if you prefer, using the dockerfile provided and supplying the token as an environment variable.

Once the bot is already on your server, you only need to follow **step 4** again to set the bot going. Note that if the code is not currently being run somewhere, the bot won't function, and it will forget any games or game channels it made earlier if it closes while you were in the middle of a game. You can just run it on your own computer if you're happy with it only working when you're online, otherwise you'll need to find a server to keep it going.

Set your name in the privacy notice using the environment variable BOT_ADMIN_NAME.


## Custom Cards: CSV files
The ilfe _**cards.csv**_ contains a list of any custom cards you would like to add to the game. When you first download the code repository, this file already contains a list of extra cards that Huggyrei (the author of the code) likes to use. The fields are:


        Name    Origin    Gender     Description      Score
    
The 'Name' field contains the name of the character you want to add. Please make sure that this contains no curved brackets ( ). The 'Origin' field should contain the name of the franchise the character came from. 'Score' is the number of points you believe a player should earn if this is a winning card: these should range from 1 (well-known character, easy to pair up) to 3 (obscure character or very difficult to match).

'Gender' should contain a marker for the character's gender; this will be turned into an icon by the code. Use 'F' for female, 'M' for male, 'X' for non-binary/intersex/other, and 'N' when gender does not really apply here (for example: eldritch horrors, genderless AI assistants).

'Description' is an optional field. Although the card's full description will be shown when it is the card selected by the current player for the others to match with, the descriptions are otherwise not displayed when you view your hand. The setup was done because including it makes your hand list very long and difficult to read on the screen. If you would like to see the descriptions, you can change this setting by opening 'game.js' and finding the bit (it's very near the top of the file) that says _this.includeDescription=false;_. Change this to _this.includeDescription=true;_. Don't forget to keep the semicolon at the end!


## Using the Bot: Players
This information can be accessed using the command *//help*. If you're typing commands into a general channel, you need to use the prefix *//* so that the bot knows you're talking to it. If you're typing commands into your private game channel created by the bot when you joined a game, you don't need to include this prefix.

**WARNING**: _If you are using Discord on a mobile device or tablet, you may find that your device does not automatically update Discord as it is trying to save power. You could miss something; for example, an attempted theft of your items! To fix this, you need to change the power settings for Discord. This will be something like: settings->device?->battery->power management or optimise battery usage->add Discord to list of apps that don't sleep, or remove from list of apps turned off_

 - **//msg *content***: Send the message content to all players' private game channels.
 - **//start** : Start a new game. The game will end when a player reaches 10 points. _Note: you can change this in the game.js file - just edit the bit near the top that says "this.maxscore=10"_
 - **//join** : Join the game. The bot will create a new private game channel for you. A hand of 10 cards will be sent to you in your new channel along with any further game instructions.
 - **//leave** : Leave the game. You can join again later, but your score will be reset to zero. If you might come back again, it might be better to just stay in; the other players can skip your turn.
 - **//addrand** : Create a 'Rando' player, which plays the top 1-3 cards of the deck. These have been given jokey pun names. Sorry about that.
 - **//removerand** : Remove a 'Rando' player.
 - **//*n1 n2 ...*** : Send a list of numbers to play the n1th, n2th, etc. cards from your hand. Note that once you've played cards for this turn, you can't add any more to your selection, so make sure you include the whole selection in one go. Optionally, include a comment to be played anonymously with your card by adding it in parentheses at the end, e.g. `3 7 (I think they'd all be cute together)`
 - **//dis *n1 n2 ...*** : If you are not currently selecting cards to play, you can use this command to discard the n1th, n2th, etc. cards.
 - **//show** : The current player can use this command to display the cards played this turn. Note: The bot will tell you who has played and will send a message when all players have played cards. Once displayed, players who missed the round will have to wait until the next one.
 - **//n** : The current player chooses the nth played card group as the winner. Whoever played those  cards will gain points equal to the total points on their selected cards. You can also optionally include a comment in parentheses.
 - **//skip** : Skip to the next player e.g. if the current player is away from the chat channel.
 - **//groups** : Display a list of all the winning matches selected so far in this game.
 - **//end** : If you want to end the game early, use this command."
 - **//cleanup** : Delete all slash channels
 - **//folder** : View the name of the parent category. The private channels are created in this category on the server. If you are the server administrator, you can mute the parent folder so that you don't get bothered by notifications from all the individual game channels!
  - **//editfolder *name*** : You can change the name of the category folder with the editfolder command (_or else edit the folder.csv file_).



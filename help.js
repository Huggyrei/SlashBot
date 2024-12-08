export function makeHelpText1(prefix, maxPoints)
{
    var helptext = "**Welcome to Slash: Romance Without Borders!** \n";
    helptext=helptext + "Each round, the current player selects a character from their hand who will be matched.\n"
    helptext=helptext + "Players select one or more cards to form a group of emotionally bonded partnerships.\n"
    helptext=helptext + "The players may argue their case before the current player selects the winning group.\n"
    helptext=helptext + "The winner gains points equal to the points on the cards they played.\n"
    helptext=helptext + "The more cards played, the more points - but you must justify the whole group dynamic!\n"
    helptext=helptext + "Players may drift in and out. You can join or leave, or just skip a few rounds.\n"
    helptext=helptext + "The commands are as follows (leave out the prefix " + prefix + " in your private game channel):\n";
    helptext=helptext+ "**" + prefix + "msg [content]**: Send a message to all players' private game channels.\n"
    helptext=helptext + "**" + prefix + "start** : Start a new game. The game will end when a player reaches " + maxPoints +" points.\n"
    helptext=helptext + "**" + prefix + "join** : Join the game. A hand of 7 cards will be sent to you in a private channel. \n"
    helptext=helptext + "**" + prefix + "leave** : Leave the game. You can join again later, but your score will be reset to zero. \n"
    helptext=helptext + "**" + prefix + "addrand** : Create a 'Rando' player, which plays the top 1-3 cards of the deck. \n"
    helptext=helptext + "**" + prefix + "removerand** : Remove a 'Rando' player. \n"
    helptext=helptext + "**" + prefix + "n1 n2 ...** : Send a list of numbers to play the n1th, n2th, etc. cards from your hand. \n"
    helptext=helptext + "**" + prefix + "dis n1 n2 ...** : If you are not choosing cards, you can discard the n1th, n2th, etc. cards.\n" 
    helptext=helptext + "**" + prefix + "show** : The current player displays the cards that have been played this turn. \n"
    helptext=helptext + "**" + prefix + "n** : The current player chooses the nth played card as the winner. \n"
    helptext=helptext + "**" + prefix + "skip** : Skip to the next player e.g. if the current player is away from the chat channel. \n"
    helptext=helptext + "**" + prefix + "groups** : Display a list of all the winning matches selected in this game\n"
    helptext=helptext + "**" + prefix + "end** : If you want to end the game early, use this command."
    return helptext;
}
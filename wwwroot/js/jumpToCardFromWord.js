lookup.jumpToCardFromWord = function(data)
{
    var sourceCard = lookup.findCardByMainNodeId(data.parentNodeId);
    var destinationCard = lookup.findCardByMainNodeId(data.wordNode.id);
    if(destinationCard != null)
    {
        lookup.insertIntoStackOfCards(sourceCard);
        lookup.pushIntoStackOfCards(destinationCard);
        lookup.scrollToCard(destinationCard.id);
    }

};
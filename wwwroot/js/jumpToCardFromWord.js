lookup.jumpToCardFromWord = function(data)
{
    var destinationCard = lookup.findCardByMainNodeId(data.wordNode.id);
    if(destinationCard != null)
    {
        lookup.insertIntoStackOfCards(destinationCard);
        lookup.scrollToCard(destinationCard.id);
    }

};
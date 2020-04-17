lookup.jumpToCardFromQuote = function(data)
{
    var destinationCard = lookup.findCardByMainNodeId(data.id);
    if(destinationCard != null)
    {
        lookup.insertIntoStackOfCards(destinationCard);
        lookup.scrollToCard(destinationCard.id);
    }

};
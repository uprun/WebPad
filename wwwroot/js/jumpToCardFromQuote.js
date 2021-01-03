lookup.jumpToCardFromQuote = function(data)
{
    var destinationCard = lookup.findCardByMainNodeId(data.id);
    if(destinationCard != null)
    {
        lookup.pushToSearchNotesQuery(destinationCard);
        lookup.scrollToCard(destinationCard.Note.id);
    }
    event.stopPropagation();

};
lookup.jumpToCardFromQuote = function(data)
{
    var destinationCard = lookup.findCardByMainNodeId(data.id);
    if(destinationCard != null)
    {
        lookup.pushToSearchNotesQuery(destinationCard);
        lookup.onListChanged_set_scrollToLatestCard();
    }
    event.stopPropagation();

};
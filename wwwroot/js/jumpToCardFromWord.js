lookup.jumpToCardFromWord = function(data)
{
    var destinationCard = lookup.findCardByMainNodeId(data.wordNode.id);
    if(destinationCard != null)
    {
        lookup.pushToSearchNotesQuery(destinationCard);
        lookup.scrollToCard(destinationCard.Note.id);
    }
    event.stopPropagation();
};
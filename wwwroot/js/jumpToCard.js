lookup.stackOfCards = ko.observableArray([]);
lookup.jumpToCard = function(data)
{
    
    var sourceCard = lookup.findCardByMainNodeId(data.SourceId);
    var destinationCard = lookup.findCardByMainNodeId(data.DestinationId);
    if(destinationCard != null)
    {
        lookup.insertIntoStackOfCards(sourceCard);
        lookup.pushIntoStackOfCards(destinationCard);

        lookup.scrollToCard(data.Destination.id);
        

    }

};
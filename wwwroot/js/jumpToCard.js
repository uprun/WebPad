lookup.stackOfCards = ko.observableArray([]);
lookup.jumpToCard = function(data)
{
    if(lookup.stackOfCards().length === 0)
    {
        var sourceCard = lookup.findCardByMainNodeId(data.SourceId);
        lookup.stackOfCards.push(sourceCard);
    }
    var destinationCard = lookup.findCardByMainNodeId(data.DestinationId);
    lookup.stackOfCards.push(destinationCard);

};
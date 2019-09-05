lookup.stackOfCards = ko.observableArray([]);
lookup.jumpToCard = function(data)
{
    
    var sourceCard = lookup.findCardByMainNodeId(data.SourceId);
    lookup.insertIntoStackOfCards(sourceCard);
    
    var destinationCard = lookup.findCardByMainNodeId(data.DestinationId);
    lookup.pushIntoStackOfCards(destinationCard);

};
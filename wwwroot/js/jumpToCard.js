lookup.stackOfCards = ko.observableArray([]);
lookup.jumpToCard = function(data)
{
    
    var sourceCard = lookup.findCardByMainNodeId(data.SourceId);
    var destinationCard = lookup.findCardByMainNodeId(data.DestinationId);
    if(destinationCard != null)
    {
        lookup.insertIntoStackOfCards(sourceCard);
        lookup.pushIntoStackOfCards(destinationCard);
        var cards = $('#' + data.Destination.id);

        if(typeof(cards) !== "undefined" && cards.length > 0)
        {
            cards[0].scrollIntoView();
        }
        

    }

};
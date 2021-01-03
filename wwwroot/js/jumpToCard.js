lookup.jumpToCard = function(data)
{
    
    var sourceCard = lookup.findCardByMainNodeId(data.SourceId);
    var destinationCard = lookup.findCardByMainNodeId(data.DestinationId);
    if(destinationCard != null)
    {
        lookup.scrollToCard(data.Destination.id);
    }

};
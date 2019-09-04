lookup.jumpToCardOnCreate = function(data)
{
    lookup.stackOfCards.removeAll();
    var newlyCreatedCard = lookup.findCardByMainNodeId(data.id);
    lookup.stackOfCards.push(newlyCreatedCard);
};
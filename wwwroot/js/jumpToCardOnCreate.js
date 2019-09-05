lookup.jumpToCardOnCreate = function(data)
{
    var newlyCreatedCard = lookup.findCardByMainNodeId(data.id);
    lookup.insertIntoStackOfCards(newlyCreatedCard);
};
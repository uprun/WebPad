lookup.jumpToCardOnCreate = function(data)
{
    var newlyCreatedCard = lookup.findCardByMainNodeId(data.id);
    lookup.insertIntoStackOfCards(newlyCreatedCard);
    var cards = $('#' + data.id);

    if(typeof(cards) !== "undefined" && cards.length > 0)
    {
        cards[0].scrollIntoView();
    }
};
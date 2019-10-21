lookup.insertIntoStackOfCards = function(card)
{
    var index = lookup.stackOfCards.indexOf(card);
    if(index >= 0)
    {
        lookup.stackOfCards.splice(index + 1);
    }
    else
    {
        lookup.stackOfCards.removeAll();
        lookup.stackOfCards.push(card);
    }
};
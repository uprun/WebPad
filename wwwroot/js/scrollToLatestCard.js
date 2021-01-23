lookup.scrollToLatestCard = function()
{
    if(lookup.FilteredCards().length > 0)
    {
        var topCard = lookup.FilteredCards()[0];
        lookup.scrollToCard(topCard.Note.id);
    }

};
lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.rollbackSearchNotesQuery = function()
{
    if(lookup.stackSearchNotesQuery().length > 0)
    {
        previousQuery = lookup.stackSearchNotesQuery.pop();
        lookup.onListChanged_setScrollTopOffset(previousQuery.scrollPosition);
        lookup.SearchNotesQuery(previousQuery.query);
        lookup.SetCurrentResultLimit(previousQuery.amountOfCardsLimit)
    }
    else
    {
        lookup.SearchNotesQuery("");
        lookup.onListChanged_set_scrollToLatestCard();
    }
    
};
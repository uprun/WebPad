lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.rollbackSearchNotesQuery = function()
{
    if(lookup.stackSearchNotesQuery().length > 0)
    {
        previousQuery = lookup.stackSearchNotesQuery.pop();
        lookup.globalOffsetY(previousQuery.scrollPosition);
        lookup.SearchNotesQuery(previousQuery.query);
        lookup.SetCurrentResultLimit(previousQuery.amountOfCardsLimit)
    }
    else
    {
        lookup.SearchNotesQuery("");
        lookup.resetGlobalOffsetY();
    }
    
};
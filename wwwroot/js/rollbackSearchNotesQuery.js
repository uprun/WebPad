lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.rollbackSearchNotesQuery = function()
{
    var previousQuery = "";
    if(lookup.stackSearchNotesQuery().length > 0)
    {
        previousQuery = lookup.stackSearchNotesQuery.pop();
    }
    lookup.onListChanged_setScrollTopOffset(previousQuery.scrollPosition);
    lookup.SearchNotesQuery(previousQuery.query);
    lookup.CurrentResultLimit(previousQuery.amountOfCardsLimit)
};
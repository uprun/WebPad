lookup.pushToSearchNotesQueryText = function(query)
{
    var currentValue = lookup.SearchNotesQuery().trim();
    
    
    lookup.stackSearchNotesQuery.push(
        {
            query: currentValue,
            scrollPosition: lookup.globalOffsetY(),
            amountOfCardsLimit: lookup.CurrentResultLimit()
        }
    );


    var newQuery = query.trim();
    lookup.SearchNotesQuery(newQuery);
    lookup.ResetCurrentResultLimit();
};
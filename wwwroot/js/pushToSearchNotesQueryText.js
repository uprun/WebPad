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
    history.pushState({ query: newQuery }, "#" + newQuery, "?hash_tag=" + newQuery);
    lookup.SearchNotesQuery(newQuery);
    lookup.ResetCurrentResultLimit();
};
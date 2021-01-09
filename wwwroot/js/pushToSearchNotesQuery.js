lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.pushToSearchNotesQuery = function(dataCard)
{
    var currentValue = lookup.SearchNotesQuery().trim();
    
    
    lookup.stackSearchNotesQuery.push(
        {
            query: currentValue,
            scrollPosition: lookup.viewportScrollPosition(),
            amountOfCardsLimit: lookup.CurrentResultLimit()
        }
    );


    var newQuery = dataCard.Note.text().trim();
    lookup.SearchNotesQuery(newQuery);
    lookup.ResetCurrentResultLimit();
};
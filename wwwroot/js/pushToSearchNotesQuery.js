lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.pushToSearchNotesQuery = function(dataCard)
{
    var currentValue = lookup.SearchNotesQuery().trim();
    
    
    lookup.stackSearchNotesQuery.push(currentValue);
    var newQuery = dataCard.Note.text().trim();
    lookup.SearchNotesQuery(newQuery);
};
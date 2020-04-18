lookup.pushToSearchNotesQuery = function(dataCard)
{
    var newQuery = dataCard.Note.text();
    lookup.SearchNotesQuery(newQuery);
};
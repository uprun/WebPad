lookup.pushToSearchNotesQueryText = function(query)
{
    var newQuery = query.trim();
    lookup.SearchNotesQuery(newQuery);
    lookup.ResetCurrentResultLimit();
};
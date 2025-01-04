lookup.pushToSearchNotesQueryText = function(query, index_to_preserve)
{
    var newQuery = query;
    lookup.Index_to_preserve(index_to_preserve);
    lookup.SearchNotesQuery(newQuery);
    lookup.ResetCurrentResultLimit();
};
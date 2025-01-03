lookup.pushToSearchNotesQueryText = function(query)
{
    var newQuery = query.trim();
    //history.pushState({ query: newQuery }, "#" + newQuery, "?hash_tag=" + newQuery);
    lookup.SearchNotesQuery(newQuery);
    lookup.ResetCurrentResultLimit();
};
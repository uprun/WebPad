lookup.reset_current_search_context = function(search_query)
{
    lookup.FilteredOperations.removeAll();
    lookup.current_search_context = {};
    lookup.current_search_context.search_query = search_query.toLowerCase();
    lookup.current_search_context.operationsToWorkWith = lookup.Operations_And_Options();
    var index_to_preserve = search_query.length / 2;
    if (lookup.Index_to_preserve() >= 0)
    {
        index_to_preserve = lookup.Index_to_preserve();
    }
    lookup.current_search_context.mupliple_searches = 
        lookup.all_substrings_with_index_to_preserve(lookup.current_search_context.search_query, index_to_preserve);
    lookup.current_search_context.map = {};
    lookup.current_search_context.single_search_index = 0;
    lookup.current_search_context.search_index = lookup.current_search_context.operationsToWorkWith.length - 1;
};
lookup.reset_current_search_context(lookup.SearchNotesQuery());
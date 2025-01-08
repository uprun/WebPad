
lookup
    .SearchNotesQuery
    .subscribe(function(value)
    {
        lookup.reset_current_search_context(value);
    });

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

lookup.iterative_search_loop = function()
{
    lookup.iterative_search();
    lookup.iterative_search_loop_handler = setTimeout(lookup.iterative_search_loop, 30);
};

lookup.iterative_search_loop_handler = setTimeout(lookup.iterative_search_loop, 30);

lookup.search_status_message = ko.observable("");
lookup.update_search_status_message = function()
{
    lookup.search_status_message(`Searching ${lookup.current_search_context.single_search_index + 1} out of ${lookup.current_search_context.mupliple_searches.length} smaller searches`);
};

lookup.iterative_search = function()
{
    var iterations_counter = 0;
    var start_time = new Date();
    for ( ; lookup.current_search_context.single_search_index < lookup.current_search_context.mupliple_searches.length; lookup.current_search_context.single_search_index++)
    {
        var single_search = lookup.current_search_context.mupliple_searches[lookup.current_search_context.single_search_index];
        for( ;lookup.current_search_context.search_index >= 0; lookup.current_search_context.search_index --)
        {
            iterations_counter++;
            if (iterations_counter % 1000 === 0)
            {
                var current_time = new Date();
                var time_diff_miliseconds = current_time - start_time;
                if (time_diff_miliseconds > 30)
                {
                    lookup.update_search_status_message();
                    console.log("exit by time-out after", iterations_counter)
                    return;
                }
            }
            if (lookup.FilteredOperations().length >= lookup.CurrentResultLimit())
            {
                lookup.update_search_status_message();
                return;
            }

            var item = lookup.current_search_context.operationsToWorkWith[lookup.current_search_context.search_index];
            var searchResult = lookup.does_it_match_search(item, single_search);
            if ( searchResult )
            {
                var key = item.toTupleKey();
                if (key in lookup.current_search_context.map)
                {
                    searchResult = false;
                }
                else
                {
                    lookup.current_search_context.map[key] = true;
                    lookup.FilteredOperations.push(item);
                }
            }
        }
        lookup.current_search_context.search_index = lookup.current_search_context.operationsToWorkWith.length - 1;
    }
};
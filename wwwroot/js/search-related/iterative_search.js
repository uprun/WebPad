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
                    return;
                }
            }
            if (lookup.FilteredOperations().length >= lookup.CurrentResultLimit())
            {
                lookup.update_search_status_message();
                return;
            }
            var item = lookup.current_search_context.operationsToWorkWith[lookup.current_search_context.search_index];
            if ( lookup.does_it_match_search(item, single_search) )
            {
                var key = item.toTupleKey();
                if ( (key in lookup.current_search_context.map) === false)
                {
                    lookup.current_search_context.map[key] = true;
                    lookup.FilteredOperations.push(item);
                }
            }
        }
        lookup.current_search_context.search_index = lookup.current_search_context.operationsToWorkWith.length - 1;
    }
};
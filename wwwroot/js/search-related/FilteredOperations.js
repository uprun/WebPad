lookup.FilteredOperations = ko.pureComputed
        (
            function()
            {
                var search_query = lookup.SearchNotesQuery().toLowerCase();
                var operationsToWorkWith =  lookup.Operations_And_Options();
                {
                    var index_to_preserve = search_query.length / 2;
                    if (lookup.Index_to_preserve() >= 0)
                    {
                        index_to_preserve = lookup.Index_to_preserve();
                    }

                    var mupliple_searches = lookup.all_substrings_with_index_to_preserve(search_query, index_to_preserve);
                    var result = [];
                    var map = {};

                    for (var single_search of mupliple_searches)
                    {
                        for(var search_index = operationsToWorkWith.length - 1; search_index >= 0; search_index --)
                        {
                            var item = operationsToWorkWith[search_index];
                            var searchResult = lookup.does_it_match_search(item, single_search);
                            if ( searchResult )
                            {
                                var key = item.toTupleKey();
                                if (key in map)
                                {
                                    searchResult = false;
                                }
                                else
                                {
                                    map[key] = true;
                                    result.push(item);
                                }
                            }
                            if (result.length > 1000)
                            {
                                return result;
                            }
                        }
                    }
                    return result;
                }
            }
        );
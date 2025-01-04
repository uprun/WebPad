lookup.FilteredOperations = ko.pureComputed
        (
            function()
            {
                var search_query = lookup.SearchNotesQuery().toLowerCase();
                var operationsToWorkWith = lookup.Operations_And_Options();
                operationsToWorkWith.reverse();
                if(search_query.length === 0)
                {
                    return operationsToWorkWith;
                }
                else
                {
                    // [2022-01-09] Aliases should search only by backward-index (from word to note)
                    // [2022-01-09] if search query matches any present word then it should search by word-backward-index
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
                        const filtered_operations = ko.utils.arrayFilter
                        (
                            operationsToWorkWith,
                            function(item, index)
                            {
                                if(item.name === 'create')
                                {
                                    var searchResult =  item.data.text.toLowerCase().indexOf(single_search) >= 0;
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
                                        }
                                    }
                                    return searchResult;
                                }
                                else
                                {
                                    if(item.name === 'quote' || item.name === 'quote-edit')
                                    {
                                        var searchResult1 = item.data.quoted.text.toLowerCase().indexOf(single_search) >= 0;
                                        var searchResult2 = item.data.current.text.toLowerCase().indexOf(single_search) >= 0;
                                        var searchResult =  searchResult1 || searchResult2;
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
                                            }
                                        }
                                        return searchResult;
                                    }
                                    else
                                    {
                                        return false;
                                    }
                                }
                            }
                        );
                        result = result.concat(filtered_operations);
                        if (result.length > 1000)
                        {
                            return result;
                        }
                    }
                    // classic search approach
                    return result;
                }
            }
        );
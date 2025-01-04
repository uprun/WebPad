lookup.FilteredOperations = ko.pureComputed
        (
            function()
            {
                var search_query = lookup.SearchNotesQuery().trim().toLowerCase();
                var operationsToWorkWith = lookup.Operations_And_Options();
                if(search_query.length === 0)
                {
                    return operationsToWorkWith;
                }
                else
                {
                    // [2022-01-09] Aliases should search only by backward-index (from word to note)
                    // [2022-01-09] if search query matches any present word then it should search by word-backward-index
                    var aliases = [search_query]
                        .filter(query => query.length > 0);
                    var reduced = aliases.reduce((ac, elem) => { ac[elem] = true; return ac;}, {});
                    aliases = Object.getOwnPropertyNames(reduced);
                    // classic search approach
                    const filtered_operations = ko.utils.arrayFilter
                    (
                        operationsToWorkWith,
                        function(item, index)
                        {
                            if(item.name === 'create')
                            {
                                var searchResult =  aliases.some( query => item.data.text.toLowerCase().indexOf(query) >= 0);
                                return searchResult;
                            }
                            else
                            {
                                if(item.name === 'quote' || item.name === 'quote-edit')
                                {
                                    var searchResult1 = aliases.some( query => item.data.quoted.text.toLowerCase().indexOf(query) >= 0);
                                    var searchResult2 = aliases.some( query => item.data.current.text.toLowerCase().indexOf(query) >= 0);
                                    return searchResult1 || searchResult2;
                                }
                                else
                                {
                                    return false;
                                }
                            }
                        }
                    );
                    return filtered_operations;
                }
            }
        );
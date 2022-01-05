lookup.find_aliases = function(query)
    {
        query = query.toLowerCase();
        var operationsToWorkWith = lookup.Operations_And_Demo();
        var aliases = operationsToWorkWith
            .filter(item => 
                {
                    if(item.name === 'create')
                    {
                        var splitted = item.data.text.toLowerCase().split(" ").filter(x => x.length > 0);
                        return splitted.length === 2 && (splitted[0] === query || splitted[1] === query);
                    }
                    else
                    {
                        return false;
                    }
                }
                     )
            .flatMap( item => item.data.text.toLowerCase().split(" ").filter(x => x.length > 0));
        return aliases;
    };
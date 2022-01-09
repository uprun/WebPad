lookup.find_aliases = function(query)
    {
        // backend-worker context
        query = query.trim().toLowerCase();
        const found_aliases = lookup.Aliases[query];
        if(typeof(found_aliases) === 'undefined')
        {
            return [];
        }
        else
        {
            return Object.getOwnPropertyNames(found_aliases).filter(element => found_aliases[element]);
        }
    };
lookup.load_aliases = function()
    {
        // if there is no aliases => generate them
        // save last processed importing date
        var data = {};
        if(typeof(lookup.localStorage["Aliases"]) !== 'undefined')
        {
            data.Aliases = lookup.localStorage.getItem("Aliases");
            lookup.backendWorker.sendQuery('populate_Aliases', data);
        }
        else
        {
            lookup.backendWorker.sendQuery('regenerate_Aliases', data);
        }
    };
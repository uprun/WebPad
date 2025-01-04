lookup.LimitedFilteredOperations = ko.pureComputed(function()
    {
        var startIndex = lookup.FilteredOperations().length - lookup.CurrentResultLimit()
        if(startIndex < 0)
        {
            startIndex = 0;
        }
        var result =  lookup.FilteredOperations().slice(startIndex);
        return result;
    });
lookup.hidden_operations_count = ko.pureComputed(function()
    {
        return lookup.FilteredOperations().length - lookup.LimitedFilteredOperations().length;
    });
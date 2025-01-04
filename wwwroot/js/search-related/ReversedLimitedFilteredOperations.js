lookup.ReversedLimitedFilteredOperations = ko.pureComputed(
    function()
    {
        var result = lookup.LimitedFilteredOperations();
        result.reverse();
        return result;
    }
);
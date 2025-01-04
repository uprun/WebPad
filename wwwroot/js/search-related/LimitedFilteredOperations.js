lookup.LimitedFilteredOperations = ko.pureComputed(function()
    {
        var to_work_with = lookup.FilteredOperations();
        var selected_length = lookup.CurrentResultLimit();
        if(selected_length > to_work_with.length)
        {
            selected_length = to_work_with.length;
        }
        var result =  to_work_with.slice(0,selected_length);
        return result;
    });
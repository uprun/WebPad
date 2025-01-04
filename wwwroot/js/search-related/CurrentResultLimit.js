lookup.CurrentResultLimit = ko.observable(45);
lookup.ResetCurrentResultLimit = function()
{
    lookup.CurrentResultLimit(45);
};

lookup.ExtendAmountForCurrentResultLimit = 45;


lookup.ExtendCurrentResultLimit = function()
{
    lookup.CurrentResultLimit(lookup.CurrentResultLimit() + lookup.ExtendAmountForCurrentResultLimit);
};

lookup.SetCurrentResultLimit = function(value)
{
    lookup.CurrentResultLimit(value);
};
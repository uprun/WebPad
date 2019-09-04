lookup.showSearchResultOfCards = ko.computed(function()
{
    return lookup.stackOfCards().length === 0 || lookup.previousConnectFrom() != null;
});
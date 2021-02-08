lookup.operationToBeQuoted = ko.observable(undefined);
lookup.actualTextOfQuote = ko.observable(undefined);
lookup.colorOfNextQuote = ko.observable(undefined);

lookup.beginToQuoteText = function(data)
{
    lookup.colorOfNextQuote(lookup.GetRandomColor().Color());
    lookup.actualTextOfQuote("");
    lookup.operationToBeQuoted(data);
};
lookup.beginToQuoteEditText = function(data)
{
    lookup.colorOfNextQuote(lookup.GetRandomColor().Color());
    lookup.actualTextOfQuote(data.text);
    lookup.operationToBeQuoted(data);
    
};
lookup.cancelAddingQuote = function()
{
    lookup.operationToBeQuoted(undefined);
};
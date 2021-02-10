lookup.operationToBeQuoted = ko.observable(undefined);
lookup.actualTextOfQuote = ko.observable(undefined);
lookup.colorOfNextQuote = ko.observable(undefined);
lookup.isQuoteEdit = ko.observable(false);

lookup.beginToQuoteText = function(data)
{
    lookup.colorOfNextQuote(lookup.GetRandomColor().Color());
    lookup.isQuoteEdit(false);
    lookup.actualTextOfQuote("");
    lookup.operationToBeQuoted(data);
    event.stopPropagation();
};
lookup.beginToQuoteQuotedText = function(data)
{
    lookup.colorOfNextQuote(lookup.GetRandomColor().Color());
    lookup.isQuoteEdit(false);
    lookup.actualTextOfQuote("");
    lookup.operationToBeQuoted(data.quoted);
    event.stopPropagation();
};
lookup.beginToQuoteEditText = function(data)
{
    lookup.colorOfNextQuote(lookup.GetRandomColor().Color());
    lookup.isQuoteEdit(true);
    lookup.actualTextOfQuote(data.text);
    lookup.operationToBeQuoted(data);
    event.stopPropagation();
    
};
lookup.cancelAddingQuote = function()
{
    lookup.operationToBeQuoted(undefined);
};
lookup.operationToBeQuoted = ko.observable(undefined);
lookup.actualTextOfQuote = ko.observable(undefined);
lookup.colorOfNextQuote = ko.observable(lookup.GetRandomColor().color);
lookup.isQuoteEdit = ko.observable(false);

lookup.beginToQuoteText = function(data)
{
    
    lookup.colorOfNextQuote(lookup.GetRandomColor().color);
    lookup.isQuoteEdit(false);
    lookup.actualTextOfQuote("");
    lookup.operationToBeQuoted(data);
    document.getElementById("quote-or-edit-input").focus();
    event.stopPropagation();
};
lookup.beginToQuoteQuotedText = function(data)
{
    
    lookup.colorOfNextQuote(lookup.GetRandomColor().color);
    lookup.isQuoteEdit(false);
    lookup.actualTextOfQuote("");
    lookup.operationToBeQuoted(data.quoted);
    document.getElementById("quote-or-edit-input").focus();
    event.stopPropagation();
};
lookup.beginToQuoteEditText = function(data)
{
    
    lookup.colorOfNextQuote(lookup.GetRandomColor().color);
    lookup.isQuoteEdit(true);
    lookup.actualTextOfQuote(data.text);
    lookup.operationToBeQuoted(data);
    document.getElementById("quote-or-edit-input").focus();
    event.stopPropagation();
    
};
lookup.cancelAddingQuote = function()
{
    lookup.operationToBeQuoted(undefined);
};
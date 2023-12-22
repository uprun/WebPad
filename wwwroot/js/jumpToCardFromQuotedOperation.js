lookup.jumpToCardFromQuotedOperation = function(data)
{
    lookup.pushToSearchNotesQueryText(data.quoted.text);
    lookup.resetGlobalOffsetY();
    
    event.stopPropagation();
};
lookup.jumpToCardFromQuotedOperation = function(data)
{
    lookup.pushToSearchNotesQueryText(data.quoted.text);
    lookup.onListChanged_set_scrollToLatestCard();
    
    event.stopPropagation();
};
lookup.jumpToCardFromOperation = function(data)
{
    lookup.pushToSearchNotesQueryText(data.text);
    lookup.onListChanged_set_scrollToLatestCard();
    
    event.stopPropagation();
};
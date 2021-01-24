lookup.jumpToCardFromWord = function(data)
{
    lookup.pushToSearchNotesQueryText(data.wordQuery);
    lookup.onListChanged_set_scrollToLatestCard();
    
    event.stopPropagation();
};
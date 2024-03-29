lookup.jumpToCardFromOperation = function(data)
{
    lookup.pushToSearchNotesQueryText(data.text);
    lookup.resetGlobalOffsetY();
    
    event.stopPropagation();
};
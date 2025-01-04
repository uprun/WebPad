lookup.jumpToCardFromWord = function(data)
{
    lookup.pushToSearchNotesQueryText(data.wordQuery);
    lookup.resetGlobalOffsetY();
    
    //event.stopPropagation();
    return true;
};
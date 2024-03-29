lookup.jumpToCardFromWord = function(data)
{
    const drag_threshold = 1.5 * lookup.body_anchorWidth();
    if ( lookup.body_total_movement_while_drag() > drag_threshold )
        return true;
    lookup.pushToSearchNotesQueryText(data.wordQuery);
    lookup.resetGlobalOffsetY();
    
    //event.stopPropagation();
    return true;
};
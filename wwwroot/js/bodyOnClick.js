lookup.bodyOnClick = function(e)
{
    //console.log(event);
    var offset = 
    {
        x: event.pageX,
        y: event.pageY
    };

    const drag_threshold = 3 * lookup.body_anchorWidth();
    if ( lookup.body_total_movement_while_drag() > drag_threshold )
    {
        // to prevent click handler after drag, but allow it if drag was small
        lookup.body_total_movement_while_drag(0);
        return;
    }

    if(lookup.menuIsOpen() || lookup.optionsIsOpen())
    {
        lookup.hideMenu();
        lookup.hideOptions();
    }

    lookup.showOmniBox();
};
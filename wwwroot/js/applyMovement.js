lookup.applyMovement = function (deltaY, deltaX) 
{
    var newOffsetY = lookup.globalOffsetY() + deltaY;
    
    //console.log("Global offset:", newOffsetY);
    var sum = 0;
    const cards = lookup.LimitedFilteredOperations().concat(lookup.LimitedFilteredOperations_below());
    cards.forEach( e => sum += e.offsetHeight());
    var a = 0;
    var b = 0;
    if(lookup.LimitedFilteredOperations().length > 0)
    { 
        let last = lookup.LimitedFilteredOperations()[lookup.LimitedFilteredOperations().length - 1];
        a = last.offset_bottom() + last.offsetHeight(); 
    }
    else
    {
        const first_below = lookup.LimitedFilteredOperations_below()[0];
        a = first_below.offset_bottom() + first_below.offsetHeight();
    }
    if (lookup.LimitedFilteredOperations_below().length > 0)
    {
        let last = lookup.LimitedFilteredOperations_below()[lookup.LimitedFilteredOperations_below().length - 1];
        b = last.offset_bottom();
    }
    else
    {
        b = lookup.LimitedFilteredOperations()[0].offset_bottom();
    }
    const max_Y = -a + lookup.cards_container_height() * 0.1;
    const min_Y = -b;
    newOffsetY = Math.min(newOffsetY, min_Y);
    
    newOffsetY = Math.max(newOffsetY, max_Y);
    lookup.globalOffsetY(newOffsetY);
};
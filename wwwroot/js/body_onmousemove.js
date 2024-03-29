lookup.body_onmousemove = function()
{
    //console.log(event);
    if(lookup.body_is_dragged())
    {
        const deltaX = event.movementX;
        const deltaY = event.movementY;
        lookup.applyMovement(-deltaY, deltaX);
        lookup.body_total_movement_while_drag(lookup.body_total_movement_while_drag() + Math.abs(deltaX) + Math.abs(deltaY));
    }
    else
    {
        //console.log("NO DRAG");
    }
};
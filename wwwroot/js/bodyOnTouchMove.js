lookup.bodyOnTouchMove = function()
{
    //console.log(event);
    var touches = event.changedTouches;
    if(touches.length > 0 )
    {
        const clientX = touches[0].clientX;
        const clientY = touches[0].clientY;
        if(typeof(lookup.previosTouch) !== "undefined")
        {
            var deltaX = lookup.previosTouch.x - clientX;
            var deltaY = lookup.previosTouch.y - clientY;
            lookup.applyMovement(deltaY, deltaX);
        }
        lookup.previosTouch = {x: clientX, y: clientY};
    }
};
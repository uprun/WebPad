lookup.applyMovement = function (deltaY, deltaX) 
{
    var newOffsetY = lookup.globalOffsetY() + deltaY;
    // const max_Y = lookup.globalMaxY();
    // newOffsetY = Math.min(newOffsetY, max_Y);
    // const min_Y = lookup.globalMinY() + document.body.offsetHeight;
    // newOffsetY = Math.max(newOffsetY, min_Y);
    lookup.globalOffsetY(newOffsetY);

    // var newOffsetX = lookup.globalOffsetX() - deltaX ;
    // const max_X = lookup.globalMaxX();
    // newOffsetX = Math.min(newOffsetX, max_X);
    // const min_X = lookup.globalMinX() + document.body.offsetWidth;
    // newOffsetX = Math.max(newOffsetX, min_X);
    // lookup.globalOffsetX(newOffsetX);
    //console.log({x: newOffsetX, min_X: min_X, y: newOffsetY, min_Y: min_Y});
};
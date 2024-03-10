lookup.applyMovement = function (deltaY, deltaX) 
{
    var newOffsetY = lookup.globalOffsetY() + deltaY;
    
    console.log("Global offset:", newOffsetY);
    const max_Y = lookup.globalMaxY();
    const min_Y = lookup.globalMinY();
    newOffsetY = Math.min(newOffsetY, min_Y);
    
    newOffsetY = Math.max(newOffsetY, max_Y);
    lookup.globalOffsetY(newOffsetY);

    // var newOffsetX = lookup.globalOffsetX() - deltaX ;
    // const max_X = lookup.globalMaxX();
    // newOffsetX = Math.min(newOffsetX, max_X);
    // const min_X = lookup.globalMinX() + document.body.offsetWidth;
    // newOffsetX = Math.max(newOffsetX, min_X);
    // lookup.globalOffsetX(newOffsetX);
    //console.log({x: newOffsetX, min_X: min_X, y: newOffsetY, min_Y: min_Y});
};
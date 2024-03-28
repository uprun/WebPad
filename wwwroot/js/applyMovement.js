lookup.applyMovement = function (deltaY, deltaX) 
{
    var newOffsetY = lookup.globalOffsetY() + deltaY;
    
    //console.log("Global offset:", newOffsetY);
    var sum = 0;
    lookup.LimitedFilteredOperations().forEach( e => sum += e.offsetHeight());
    const max_Y = -sum;
    const min_Y = lookup.globalScreenHeight() * 0.6;
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
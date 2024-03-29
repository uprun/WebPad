lookup.bodyOnWheel = function() {
    // really changing to span fixes breaks?
    // yeah if you want correct line-break use span instead of div
    // just test  
    // what if there is more text?
    
        event.preventDefault();
        const deltaY = event.deltaY;
        const deltaX = event.deltaX;
        //console.log(event);
        lookup.applyMovement(deltaY, deltaX);
      
        //scale += event.deltaY * -0.01;
    
    
    };
lookup.freeLocalIndex = 0;
lookup.localPrefix = '_local_';

lookup.getLocalIndex = function() {
    while(true)
    {
        var index = ( lookup.localPrefix + (lookup.freeLocalIndex++) );
        var searchResultEdge = lookup.findEdgeById(index);
        var searchResultNode = lookup.findNodeById(index);
        if(typeof(searchResultEdge) === 'undefined' && searchResultNode == lookup.findNodeById_notFound) 
        {
            return index;
        }
    }
};
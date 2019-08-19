lookup.findEdgeById_buffer = undefined;
lookup.findEdgeById = function(id)
{
    if(typeof(lookup.findEdgeById_buffer) == "undefined")
    {
        lookup.findEdgeById_buffer = {};
        ko.utils.arrayForEach
        (
            lookup.Connections(), 
            function(item) 
                {
                    lookup.findEdgeById_buffer[item.id] = item;
                }
        );
    }
    var result = lookup.findEdgeById_buffer[id];
    if(typeof(result) == "undefined")
    {
        var filtered = ko.utils.arrayFilter(lookup.Connections(), function(item){ return item.id == id;} );
        result = filtered.length > 0 ? filtered[0] : null;
    }

    
    return result;

}
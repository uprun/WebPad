lookup.findNodeById_buffer = undefined;
lookup.findNodeById_notFound = new model_Node({id: -1, text: 'not found'});
lookup.findNodeById = function(id)
{
    if(typeof(lookup.findNodeById_buffer) == "undefined")
    {
        lookup.findNodeById_buffer = {};
        ko.utils.arrayForEach
        (
            lookup.Notes(), 
            function(item) 
                {
                    lookup.findNodeById_buffer[item.id] = item;
                }
        );
    }

    var result = lookup.findNodeById_buffer[id];
    if(typeof(result) == "undefined")
    {
        var filtered = ko.utils.arrayFilter(lookup.Notes(), function(item){ return item.id == id;} );
        result = filtered.length > 0 ? filtered[0] : null;
    }
    if(result == null)
    {
        result = lookup.findNodeById_notFound;
    }

    return result;

};
lookup.ConnectNotes = function(from, to, label, generated) {
    var connectionToAdd = lookup.Instanciate_model_connection(
        {
            id: lookup.getLocalIndex(),
            sourceId: from.id,
            destinationId: to.id,
            label: label ? label : "", 
            generated: generated,
            findNodeByIdFunc: lookup.findNodeById
        }
    );
    var added = connectionToAdd.ConvertToJs();
    var filtered = ko.utils.arrayFilter(
        lookup.Connections(), 
        function(item)
            { 
                return item.SourceId == connectionToAdd.SourceId &&
                    item.DestinationId == connectionToAdd.DestinationId &&
                    item.label() == connectionToAdd.label();
            } 
        );
    // don't allow to create duplicate connections
    if(filtered.length === 0)
    {
        console.log("adding connection #" + connectionToAdd.id );
        lookup.pushToHistory({
            action: lookup.actions.ConnectionAdded,
            data: added
        });
    }
    else
    {
        console.log("it is not allowed to create duplicate connections");
    }
    
};
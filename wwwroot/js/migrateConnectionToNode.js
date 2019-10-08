lookup.migrateConnectionToNode = function()
{
    ko.utils.arrayForEach(lookup.Connections(), function(item) {
        if(typeof(item) !== "undefined")
        {
            if(typeof(item.label()) !== "undefined" && item.label().trim().length > 0)
            {
                var objLabel = {
                    text: item.label().trim()
                };
                // node from label
                lookup.CreateNote(objLabel, function(createdNodeFromLabel) { 
                    var objCombined = {
                        text: createdNodeFromLabel.text() + ' ' + item.Destination.text()
                    };
                    lookup.CreateNote(objCombined, function(createdNodeFromCombined) { 
                        
                        lookup.ConnectNotes(createdNodeFromCombined, createdNodeFromLabel);  
                        lookup.ConnectNotes(createdNodeFromCombined, item.Destination);  
                        lookup.ConnectNotes(item.Source, createdNodeFromCombined);  
                        lookup.RemoveConnection(item);
                    });
                });
            }

        }
        
    });

};
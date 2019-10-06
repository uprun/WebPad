lookup.processMessageFromOuterSpace = function(item)
    {
        var current_action = item.action;
        var current_data = item.data;
        if(current_action == lookup.actions.NoteUpdated)
        {
            var found = lookup.findNodeById(current_data.id);
            if(found)
            {
                found.text(current_data.text);
                found.color = current_data.color;
                found.background = current_data.background;
                found.x = current_data.x;
                found.y = current_data.y;
            }
            else
            {
                var noteToAdd = lookup.Instanciate_model_node(current_data);
                lookup.Notes.push(noteToAdd);
            }
        }

        if(current_action == lookup.actions.ConnectionUpdated)
        {
            var found = lookup.findEdgeById(current_data.id);
            if(found)
            {
                found.label(current_data.label);
            }
            else
            {
                var connectionToAdd = 
                lookup.Instanciate_model_connection
                    (
                        {
                            id: current_data.id,
                            sourceId: current_data.SourceId,
                            destinationId: current_data.DestinationId,
                            label: current_data.label,
                            generated: current_data.generated,
                            findNodeByIdFunc: lookup.findNodeById
                        }
                    );
                lookup.Connections.push(connectionToAdd)
            }
        }

        if(current_action == lookup.actions.NoteAdded)
        {
            var found = lookup.findNodeById(current_data.id);
            if( !found || found.id == -1 )
            {
                var noteToAdd = lookup.Instanciate_model_node(current_data);
                lookup.Notes.push(noteToAdd);
                lookup.findNodeById_buffer[noteToAdd.id] = item;
                var cardToAdd = new model_Card({ Note: noteToAdd});
                lookup.hashCards[noteToAdd.id] = cardToAdd;
                lookup.composedCards.push(cardToAdd);
            }
            else
            {
                if(!found.id.startsWith(lookup.localPrefix))
                {
                    found.text(current_data.text);
                }
            }
            
        }

        if(current_action == lookup.actions.NoteDeleted)
        {
            var found = lookup.findNodeById(current_data.id);
            if(found)
            {
                lookup.Notes.remove(found);
            }
        }

        if(current_action == lookup.actions.ConnectionAdded)
        {
            var found = lookup.findEdgeById(current_data.id);
            if(!found)
            {
                var connectionToAdd = 
                lookup.Instanciate_model_connection
                    (
                        {
                            id: current_data.id,
                            sourceId: current_data.SourceId,
                            destinationId: current_data.DestinationId, 
                            label: current_data.label, 
                            generated: current_data.generated,
                            findNodeByIdFunc: lookup.findNodeById
                        }
                    );
                lookup.Connections.push(connectionToAdd)
                var found = lookup.hashCards[connectionToAdd.SourceId];
                if(found)
                {
                    found.Tags.push(connectionToAdd);
                }
            }
            else
            {
                if(!found.id.startsWith(lookup.localPrefix))
                {
                    found.label(current_data.label);
                }
            }
        }

        if(current_action == lookup.actions.ConnectionDeleted)
        {
            var found = lookup.findEdgeById(current_data.id);
            if(found)
            {
                lookup.Connections.remove(found);
            }
        }

        // if(current_action == lookup.actions.HealthCheckRequest)
        // {
        //     var toStoreNotes = ko.utils.arrayMap(lookup.Notes(), function(item) {
        //         return item.id;
        //     });
        //     var toStoreConnections = ko.utils.arrayMap(lookup.Connections(), function(item) {
        //         return item.id;
        //     });
        //     var all_available_ids = toStoreNotes.concat(toStoreConnections);
        //     var chunked_ids = all_available_ids.chunk(40);

        //     ko.utils.arrayForEach(chunked_ids, function(item, id) {
        //         self.pushToHistory({
        //             action: lookup.actions.HealthCheckIdsProposal,
        //             data: { 
        //                 checkedIndex: undefined,
        //                 publicKey: publicKey.publicKey 
        //             }
        //         });
        //     });


        // }
    };
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
                found.isDone(current_data.isDone);
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
                lookup.findNodeById_buffer[noteToAdd.id] = noteToAdd;
                var obj = { Note: noteToAdd};
                if(typeof(noteToAdd.hasIncomingConnection) !== 'undefined' && noteToAdd.hasIncomingConnection)
                {
                    obj.connections_incoming = [];
                }

                var cardToAdd = new model_Card(obj);
                lookup.hashCards[noteToAdd.id] = cardToAdd;
                lookup.composedCards.push(cardToAdd);
                lookup.generateDictionary_NoteAdded(noteToAdd);
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
                var foundHashCard = lookup.hashCards[current_data.id];
                if(foundHashCard)
                {
                    lookup.composedCards.remove(foundHashCard);
                }
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
                lookup.findEdgeById_buffer[connectionToAdd.id] = connectionToAdd;
                lookup.Connections.push(connectionToAdd)
                var foundHashCard = lookup.hashCards[connectionToAdd.SourceId];
                if(foundHashCard)
                {
                    foundHashCard.Tags.unshift(connectionToAdd);
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
                var foundHashCard = lookup.hashCards[found.SourceId];
                if(foundHashCard)
                {
                    foundHashCard.Tags.remove(found);
                }
            }
        }
    };
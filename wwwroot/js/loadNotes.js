lookup.CheckIfEveryNodeHasMigratedColor = function()
    {
            ko.utils.arrayForEach(lookup.Notes(), function(item) {
                lookup.MigrationOfColorOfNode(item);
            });
    };

    lookup.composedCards = ko.observableArray([]);
    lookup.dictionary_of_notes = {};

    lookup.dictionary_of_notes_updated = ko.observable(0);

    lookup.split_search_key_and_add_to_dictionary = function(key, note_id, flag)
    {
        var index = 0;
        
        while(key.length > 0)
        {
            for(index = 0; index < key.length; index++)
            {
                var to_work_with = key.substring(index);
                var entry = lookup.dictionary_of_notes[to_work_with];
                if(typeof(entry) === 'undefined')
                {
                    lookup.dictionary_of_notes[to_work_with] = {};
                    entry = lookup.dictionary_of_notes[to_work_with];
                }
                entry[note_id] = flag;
                
            }
            key = key.substring(0, key.length - 1);
        }
    };

    lookup.generateDictionary = function()
    {
        
        ko.utils.arrayForEach(lookup.composedCards(), function(item) 
        {    
            var key = 
                item
                .Note
                .text()
                .replace("\r", " ")
                .replace("\n", " ")
                .replace("\t", " ")
                .toLowerCase()
                .trim();
            
            lookup.split_search_key_and_add_to_dictionary(key, item.Note.id, true);

        });
        var val = lookup.dictionary_of_notes_updated();
        lookup.dictionary_of_notes_updated(val + 1);
    };

    lookup.generateDictionary_NoteAdded = function(note)
    {
        
        var key = 
                note
                .text()
                .replace("\r", " ")
                .replace("\n", " ")
                .replace("\t", " ")
                .toLowerCase()
                .trim();
        lookup.split_search_key_and_add_to_dictionary(key, note.id, true);
        var val = lookup.dictionary_of_notes_updated();
        lookup.dictionary_of_notes_updated(val + 1);

    };


    lookup.populateConnections = function()
    {
        if(typeof(lookup.populateConnections_startIndex) === 'undefined')
        {
            lookup.populateConnections_startIndex = lookup.data.connections.length -1;
        }
        console.log('populateConnections: ' + lookup.populateConnections_startIndex);
        var batchArray = [];
        for(var batchKey = 0; batchKey < 100 && lookup.populateConnections_startIndex >= 0; batchKey++, lookup.populateConnections_startIndex--)
        {
            var elem = lookup.data.connections[lookup.populateConnections_startIndex];
            var connectionToAdd = lookup.Instanciate_model_connection(
                {
                    id: elem.id,
                    sourceId: elem.SourceId,
                    destinationId: elem.DestinationId,
                    label: elem.label,
                    generated: elem.generated,
                    findNodeByIdFunc: lookup.findNodeById
                });
            var found = lookup.hashCards[connectionToAdd.SourceId];
            if(found)
            {
                found.Tags.unshift(connectionToAdd);
            }
            batchArray.push(connectionToAdd);

        }
        ko.utils.arrayPushAll(lookup.Connections, batchArray);
        if(lookup.populateConnections_startIndex >= 0)
        {
            setTimeout(lookup.populateConnections, 3);
        }
        else
        {
            setTimeout(lookup.generateDictionary, 3);
        }

    };


    lookup.populateNotes = function()
    {
        
        // time consuming
        if(typeof(lookup.populateNotes_startIndex) === 'undefined')
        {
            lookup.populateNotes_startIndex = lookup.data.notes.length -1;
        }
        console.log('populateNotes: ' + lookup.populateNotes_startIndex);
        var batchArray = [];
        var cardsBatch = [];
        for(var batchKey = 0; batchKey < 100 && lookup.populateNotes_startIndex >= 0; batchKey++, lookup.populateNotes_startIndex--)
        {
            var elem = lookup.data.notes[lookup.populateNotes_startIndex];
            var noteToAdd = lookup.Instanciate_model_node(elem);
            var outgoing = lookup.outgoing_connections[noteToAdd.id];
            var incoming = lookup.incoming_connections[noteToAdd.id];
            var composedCard = new model_Card({ Note: noteToAdd, connections_incoming: incoming, connections_outgoing: outgoing });
            lookup.hashCards[noteToAdd.id] = composedCard;
            cardsBatch.push(composedCard);
            batchArray.push(noteToAdd);
        }
        ko.utils.arrayPushAll(lookup.Notes, batchArray);
        ko.utils.arrayPushAll(lookup.composedCards, cardsBatch);
        if(lookup.populateNotes_startIndex >= 0)
        {
            setTimeout(lookup.populateNotes, 3);
        }
        else
        {
            setTimeout(lookup.populateConnections, 3);
        }


        

    };

    lookup.outgoing_connections = {};
    lookup.incoming_connections = {};


    lookup.populate_incoming_outgoing_connections = function()
    {
        
        // time consuming
        if(typeof(lookup.populate_incoming_outgoing_connections_index) === 'undefined')
        {
            lookup.populate_incoming_outgoing_connections_index = lookup.data.connections.length -1;
        }
        console.log('populate_incoming_outgoing_connections: ' + lookup.populate_incoming_outgoing_connections_index);

        for(var batchKey = 0; batchKey < 100 && lookup.populate_incoming_outgoing_connections_index >= 0; batchKey++, lookup.populate_incoming_outgoing_connections_index--)
        {
            var elem = lookup.data.connections[lookup.populate_incoming_outgoing_connections_index];
            var stored_outgoing = lookup.outgoing_connections[elem.SourceId];
            if(typeof(stored_outgoing) === 'undefined')
            {
                lookup.outgoing_connections[elem.SourceId] = [];
                stored_outgoing = lookup.outgoing_connections[elem.SourceId];
            }
            stored_outgoing.push(elem);

            var stored_incoming = lookup.incoming_connections[elem.DestinationId];
            if(typeof(stored_incoming) === 'undefined')
            {
                lookup.incoming_connections[elem.DestinationId] = [];
                stored_incoming = lookup.incoming_connections[elem.DestinationId];
            }
            stored_incoming.push(elem);
            
        }

        if(lookup.populate_incoming_outgoing_connections_index >= 0)
        {
            setTimeout(lookup.populate_incoming_outgoing_connections, 3);
        }
        else
        {
            setTimeout(lookup.populateNotes, 3);
        }


        

    };

    lookup.populate = function(data) {
        lookup.for_code_access_hash_of_color_presets = {};
        lookup.data_color_presets.forEach(element => {
            lookup.for_code_access_hash_of_color_presets[element.color] = true;
        });
        lookup.data = data;

        //setTimeout(lookup.populateNotes, 30);

        lookup.populate_incoming_outgoing_connections();
        //lookup.populateConnections();
        //lookup.populateCards();

        
        

        
        
    };

lookup.populate_reset_helpers = function()
{
    lookup.populate_incoming_outgoing_connections_index = undefined;
    lookup.populateNotes_startIndex = undefined;
    lookup.populateConnections_startIndex = undefined;
};

lookup.loadNotes = function()
    {
        if(lookup.localStorage["Notes"]){
            var data = {};
            data.notes = JSON.parse(lookup.localStorage.getItem("Notes"));
            data.connections = JSON.parse(lookup.localStorage.getItem("Connections"));
            lookup.populate(data);
        }
        else
        {
            // demo notes
            var data = {};
            data.notes = [{"id":"_local_1","text":"WebPad","color":"#84bfff","background":"inherit","createDate":"2020-04-18T14:58:45.862Z","isDone":false},{"id":"_local_3","text":"wiki","color":"#ff8f95","background":"inherit","createDate":"2020-04-18T14:58:56.207Z","isDone":false},{"id":"_local_7","text":"notes taking app","color":"#64e05e","background":"inherit","createDate":"2020-04-18T14:59:07.373Z","isDone":false},{"id":"_local_11","text":"you can have a task like this saved in WebPad","color":"#ff94eb","background":"inherit","createDate":"2020-04-18T14:59:50.517Z","isDone":false},{"id":"_local_13","text":"task","color":"#84bfff","background":"inherit","createDate":"2020-04-18T14:59:54.957Z","isDone":false},{"id":"_local_17","text":"you can find additional tools if you click [..]","color":"#64e05e","background":"inherit","createDate":"2020-04-18T15:00:50.676Z","isDone":false},{"id":"_local_19","text":"task can be marked as done if you click [o]","color":"#ffbbdc","background":"inherit","createDate":"2020-04-18T15:01:29.956Z","isDone":true},{"id":"_local_21","text":"task","color":"#ff8f95","background":"inherit","createDate":"2020-04-18T15:01:35.353Z","isDone":false},{"id":"_local_26","text":"you can add either tag either quote it depends on length of text","color":"#ff94eb","background":"inherit","createDate":"2020-04-18T15:03:36.195Z","isDone":false},{"id":"_local_30","text":"quote example","color":"#64e05e","background":"inherit","createDate":"2020-04-18T15:04:12.836Z","isDone":false},{"id":"_local_34","text":"wiki","color":"#64e05e","background":"inherit","createDate":"2020-04-18T15:12:28.569Z","isDone":false},{"id":"_local_36","text":"entity","color":"#ffa26b","background":"inherit","createDate":"2020-04-18T15:12:39.088Z","isDone":false},{"id":"_local_42","text":"mobile system","color":"#ff94eb","background":"inherit","createDate":"2020-04-18T15:14:43.135Z","isDone":false},{"id":"_local_46","text":"operating system","color":"#ffa26b","background":"inherit","createDate":"2020-04-18T15:14:54.136Z","isDone":false},{"id":"_local_51","text":"you can find Android app here https://play.google.com/store/apps/details?id=ua.com.webpad","color":"#ffbbdc","background":"inherit","createDate":"2020-04-18T15:15:29.295Z","isDone":false},{"id":"_local_53","text":"personal-wiki","color":"#64e05e","background":"inherit","createDate":"2020-04-18T15:16:07.127Z","isDone":false},{"id":"_local_55","text":"personal-wiki allows you to create inter-connected notes","color":"#ff8f95","background":"inherit","createDate":"2020-04-18T15:16:33.118Z","isDone":false},{"id":"_local_57","text":"WebPad is a personal-wiki","color":"#ff94eb","background":"inherit","createDate":"2020-04-18T15:16:53.119Z","isDone":false},{"id":"_local_59","text":"try out search bar at bottom of the page you can create notes through it","color":"#ff8f95","background":"inherit","createDate":"2020-04-18T15:19:04.446Z","isDone":false}];
            data.connections = [{"id":"_local_5","SourceId":"_local_1","DestinationId":"_local_3","label":""},{"id":"_local_9","SourceId":"_local_1","DestinationId":"_local_7","label":""},{"id":"_local_15","SourceId":"_local_11","DestinationId":"_local_13","label":""},{"id":"_local_23","SourceId":"_local_19","DestinationId":"_local_21","label":""},{"id":"_local_28","SourceId":"_local_1","DestinationId":"_local_26","label":""},{"id":"_local_32","SourceId":"_local_26","DestinationId":"_local_30","label":""},{"id":"_local_38","SourceId":"_local_34","DestinationId":"_local_36","label":""},{"id":"_local_44","SourceId":"_local_40","DestinationId":"_local_42","label":""},{"id":"_local_48","SourceId":"_local_40","DestinationId":"_local_46","label":""}];
            lookup.populate(data);
        }
        lookup.scrollToCard_processQueue();
    };
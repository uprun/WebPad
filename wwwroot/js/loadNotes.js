lookup.CheckIfEveryNodeHasMigratedColor = function()
    {
            ko.utils.arrayForEach(lookup.Notes(), function(item) {
                lookup.MigrationOfColorOfNode(item);
            });
    };

    lookup.composedCards = ko.observableArray([]);
    lookup.dictionary_of_notes = {};

    lookup.generateDictionary = function()
    {
        
        ko.utils.arrayForEach(lookup.Notes(), function(item) {
            var key = 
                item
                .text()
                .replace("\r", " ")
                .replace("\n", " ")
                .replace("\t", " ")
                .toLowerCase()
                .trim();
            if(item.isReferenced())
            {

            }
            else
            {
                lookup.dictionary_of_notes[key] = item;
            }
        });
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
            lookup.generateDictionary();
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
            var composedCard = new model_Card({ Note: noteToAdd});
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

    lookup.populate = function(data) {
        lookup.for_code_access_hash_of_color_presets = {};
        lookup.data_color_presets.forEach(element => {
            lookup.for_code_access_hash_of_color_presets[element.color] = true;
        });
        lookup.data = data;

        //setTimeout(lookup.populateNotes, 30);

        lookup.populateNotes();
        //lookup.populateConnections();
        //lookup.populateCards();

        
        

        
        
    };

lookup.loadNotes = function()
    {
        if(lookup.localStorage["Notes"]){
            var data = {};
            data.notes = JSON.parse(lookup.localStorage.getItem("Notes"));
            data.connections = JSON.parse(lookup.localStorage.getItem("Connections"));
            lookup.populate(data);
        }
    };
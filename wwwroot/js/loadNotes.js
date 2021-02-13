
lookup.loadNotes = function()
    {
        var data = {};
        if(typeof(lookup.localStorage["Operations"]) !== 'undefined')
        {
            data.Operations = JSON.parse(lookup.localStorage.getItem("Operations"));
            lookup.backendWorker.sendQuery('populate_Operations', data);
        }
        else
        {
            if(typeof(lookup.localStorage["Notes"]) !== 'undefined')
            {
                data.notes = JSON.parse(lookup.localStorage.getItem("Notes"));
                data.connections = JSON.parse(lookup.localStorage.getItem("Connections"));
                //lookup.populate(data);
                lookup.backendWorker.addListener('populate.finished', function()
                {
                    console.log('populate.finished');
                    lookup.backendWorker.sendQuery('migrate_to_Operations');
                });
                lookup.backendWorker.sendQuery('populate', data);
            }
            else
            {
                lookup.backendWorker.sendQuery('populate_Operations', []);
            }
        }
        
        lookup.scrollToCard_processQueue();
    };
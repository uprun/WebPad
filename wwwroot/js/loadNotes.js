
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
                lookup.set_option_show_help_demo_notes_to_true();
            }
        }

        lookup.send_to_worker_update_for_option_show_help_demo_notes();
        
        lookup.scrollToCard_processQueue();
    };
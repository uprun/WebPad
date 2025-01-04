
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
                alert("This version does not support migration of data, use version 2.0.0 2024-03-29");
            }
            else
            {
                lookup.backendWorker.sendQuery('populate_Operations', []);
                lookup.set_option_show_help_demo_notes_to_true();
                lookup.set_option_use_Japanese_tokeniser_to_false();
            }
        }
    };
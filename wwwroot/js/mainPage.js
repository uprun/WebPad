

function ConnectedNotesViewModel()
{
    var self = this;
    

    lookup.defineLocalStorage();

    lookup.backgroundApplySaved();

    lookup.apply_saved_option_show_help_demo_notes();
    lookup.apply_saved_option_use_Japanese_tokeniser();

    lookup.hashCards = {};

    lookup.populateColorPresets();

    lookup.backendWorker = new lookup.QueryableWorker("worker-scripts/bundle-backend-worker.js?v=" + new Date().toString());

    lookup.send_to_worker_update_for_option_show_help_demo_notes();


    lookup.backendWorker.addListener('saveItemsToStorage.event', function(toStoreNotes, toStoreConnections) 
    {
        lookup.saveItemsToStorage(toStoreNotes, toStoreConnections);
    });

    lookup.backendWorker.addListener('saveOperationsToStorage.event', function(toStoreOperations) 
    {
        lookup.save_Operations_to_storage(toStoreOperations);
    });

    lookup.backendWorker.addListener('saveAliasesToStorage.event', function(toStoreAliases) 
    {
        lookup.save_Aliases_to_storage(toStoreAliases);
    });

    


    lookup.check_platform();


    lookup.LimitedFilteredOperations = ko.observableArray([]);
    //lookup.LimitedFilteredOperations.extend({ rateLimit: { timeout: 50, method: "notifyAtFixedRate" } });
    lookup.operationsToAddGradually = [];
    lookup.operationsToAddGradually_miliseconds = 10;
    lookup.operationsToAddGradually_timer = undefined;
    lookup.operations_to_add_above = [];
    lookup.operations_to_add_below = [];
    lookup.use_operation_from_above = true;
    lookup.last_id_above = 0;
    lookup.last_id_below = 0;
    lookup.operationsToAddGradually_handler = function()
    {
        var length = lookup.LimitedFilteredOperations().length;
        if (length == 0 && lookup.operationsToAddGradually.length > 0)
        {
            // find the note that should be rendered first
            var first_id = lookup.operationsToAddGradually.findIndex(e => JSON.stringify(e.ConvertToJs()) === lookup.first_to_render_note_data_stringified);
            var slice_id = 0;
            if (first_id >= 0)
            {
                slice_id = first_id;
            }
            lookup.operations_to_add_above = lookup.operationsToAddGradually.slice(0, slice_id);
            lookup.operations_to_add_below = lookup.operationsToAddGradually.slice(slice_id).reverse();
            //lookup.operationsToAddGradually = [];
            lookup.last_id_above = 0;
            lookup.last_id_below = 0;

        }

        if (length > 0 && lookup.operationsToAddGradually.length > 0)
        {
            lookup.operations_to_add_above = lookup.operationsToAddGradually.concat(lookup.operations_to_add_above);
            //lookup.operationsToAddGradually = [];
        }

        // var to_add = undefined;

        // if (lookup.use_operation_from_above)
        // {
        //     if(lookup.operations_to_add_above.length > 0)
        //     {
        //         to_add = lookup.operations_to_add_above.pop();
        //     }
            


        // }
        // lookup.use_operation_from_above = ! lookup.use_operation_from_above;
        
        var last_added = document.getElementById((length - 1) + "-card");
        var obj_last = lookup.LimitedFilteredOperations()[length - 1];
        var show_more = document.getElementById( "show-more");
        if(lookup.operationsToAddGradually.length > 0)
        {
            
            var to_add = lookup.operationsToAddGradually.pop();
            
            var next_bottom = 0;
            if (length > 0)
            {

                next_bottom = obj_last.bottom()  + last_added.offsetHeight;
            }
            
            to_add.bottom(next_bottom);
            lookup.LimitedFilteredOperations.push(to_add);
        }
        if (typeof(obj_last) !== "undefined" && obj_last.offsetHeight() < 1)
        {
            obj_last.offsetHeight(last_added.offsetHeight);
        }
        if (typeof(obj_last) !== "undefined" && obj_last.offsetHeight() > 1)
        {
            show_more.style.bottom = obj_last.bottom() + obj_last.offsetHeight() + lookup.globalOffsetY() + "px";
        }
        lookup.update_global_scroll_limits();
        lookup.operationsToAddGradually_timer = setTimeout(lookup.operationsToAddGradually_handler, lookup.operationsToAddGradually_miliseconds);
        
    };
    lookup.backendWorker.addListener('LimitedFilteredOperations.changed.event', function(cards) 
    {
        var start = new Date;
        console.log("start", start);
        lookup.LimitedFilteredOperations.removeAll();
        var next = new Date;
        console.log("removal diff", next - start)
        start = next;
        var processed = ko.utils.arrayMap(cards, function(item) {
            var operation = new lookup.model_Operation(item)
            return operation;
        });
        next = new Date
        console.log("creation diff", next - start)
        start = next;
        
        lookup.operationsToAddGradually = processed;
        
        next = new Date
        console.log("push all diff", next - start)
        start = next;
        if ( typeof(lookup.operationsToAddGradually_timer) === "undefined")
        {
            lookup.operationsToAddGradually_timer = setTimeout(lookup.operationsToAddGradually_handler, lookup.operationsToAddGradually_miliseconds);
        }
    });

    lookup.hidden_operations_count = ko.observable(0);
    lookup.backendWorker.addListener('NumberOfHiddenOperations.changed', function(length) 
    {
        lookup.hidden_operations_count(length);
    });

    lookup.CurrentResultLimit = ko.observable(45);

    lookup.backendWorker.addListener('CurrentResultLimit.changed', function(length) 
    {
        lookup.CurrentResultLimit(length);
    });

    lookup.backendWorker.addListener('populate_Operations.finished', function(length) 
    {
        //[2022-05-01] no aliases for current release, I will create a seperate UI-screen for adding them
        lookup.load_aliases();
    });

    lookup.backendWorker.addListener('import_Operations.finished', function(length) 
    {
        lookup.backendWorker.sendQuery('regenerate_Aliases');
    });

    lookup.ExtendCurrentResultLimit = function()
    {
        //lookup.onListChanged_keepHeightOffset();
        lookup.backendWorker.sendQuery("ExtendCurrentResultLimit");
    };

    lookup.ResetCurrentResultLimit = function()
    {
        lookup.backendWorker.sendQuery("ResetCurrentResultLimit");
    };

    lookup.SetCurrentResultLimit = function(value)
    {
        lookup.backendWorker.sendQuery("SetCurrentResultLimit", value);
    };

    if(typeof(Worker) == "undefined") {
        console.log("Failed to find Worker.");
    }
    if(!lookup.localStorage) {
        console.log("Local web-storage is unavailable.");
    }
  
    self.ApplyLookupToSelf = function()
    {
        for(var x in lookup)
        {
            self[x] = lookup[x];
        }
    };

    

};


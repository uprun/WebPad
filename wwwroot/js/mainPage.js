

function ConnectedNotesViewModel()
{
    //[2024-09-12] this is for sure too big method
    var self = this;
    

    lookup.defineLocalStorage();

    lookup.backgroundApplySaved();

    lookup.apply_saved_option_show_help_demo_notes();
    lookup.apply_saved_option_use_Japanese_tokeniser();


    lookup.backendWorker = new fake_backend_worker();

    lookup.send_to_worker_update_for_option_show_help_demo_notes();

    lookup.backendWorker.addListener('saveOperationsToStorage.event', function(toStoreOperations) 
    {
        lookup.save_Operations_to_storage(toStoreOperations);
    });


    lookup.check_platform();


    lookup.LimitedFilteredOperations = ko.observableArray([]);
    //lookup.LimitedFilteredOperations.extend({ rateLimit: { timeout: 50, method: "notifyAtFixedRate" } });
    lookup.operationsToAddGradually = [];
    lookup.operationsToAddGradually_miliseconds = 10;
    lookup.operationsToAddGradually_timer = undefined;

    lookup.operationsToAddGradually_handler = function()
    {
        var length = lookup.LimitedFilteredOperations().length;
        
        var last_added = document.getElementById((length - 1) + "-card");
        var obj_last = lookup.LimitedFilteredOperations()[length - 1];
        var show_more = document.getElementById( "show-more");
        if(lookup.operationsToAddGradually.length > 0)
        {
            
            var to_add = lookup.operationsToAddGradually.pop();
            lookup.LimitedFilteredOperations.push(to_add);
        }
        lookup.update_global_scroll_limits();
        lookup.operationsToAddGradually_timer = setTimeout(lookup.operationsToAddGradually_handler, lookup.operationsToAddGradually_miliseconds);
        
    };

    lookup.backendWorker.addListener('LimitedFilteredOperations.changed.event', function(cards) 
    {
        if ( typeof( lookup.first_to_render_note_data_stringified ) === "undefined")
        {}
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
        //processed.reverse();
        next = new Date
        console.log("creation diff", next - start)
        start = next;
        //ko.utils.arrayPushAll(lookup.LimitedFilteredOperations, processed);
        lookup.operationsToAddGradually = processed;
        if ( typeof(lookup.operationsToAddGradually_timer) === "undefined")
            {
                lookup.operationsToAddGradually_timer = setTimeout(lookup.operationsToAddGradually_handler, lookup.operationsToAddGradually_miliseconds);
            }
        return ;

        var first_id = processed.findIndex(e => JSON.stringify(e.ConvertToJs()) === lookup.first_to_render_note_data_stringified);
        var slice_id = 0;
        if (first_id >= 0)
        {
            slice_id = first_id + 1 ;
            lookup.operationsToAddGradually = processed.slice(0, slice_id);
            lookup.operations_to_add_below = processed.slice(slice_id).reverse();
        }
        else
        {
            
        
        }
        
        
        //lookup.operationsToAddGradually = processed;
        
        next = new Date;
        console.log("push all diff", next - start);
        start = next;
        
        if ( typeof(lookup.operations_to_add_below_timer) === "undefined")
        {
            lookup.operations_to_add_below_timer = setTimeout(lookup.operations_to_add_below_handler, lookup.operationsToAddGradually_miliseconds);
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

    lookup.ExtendCurrentResultLimit = function()
    {
        //lookup.onListChanged_keepHeightOffset();
        let visible_note_info = {};
        lookup.set_visible_note_information(visible_note_info);
        lookup.restore_first_to_render_note_information(visible_note_info);
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


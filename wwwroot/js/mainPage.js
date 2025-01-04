

function ConnectedNotesViewModel()
{
    //[2024-09-12] this is for sure too big method
    var self = this;
    

    lookup.defineLocalStorage();

    lookup.backgroundApplySaved();

    lookup.apply_saved_option_show_help_demo_notes();
    lookup.apply_saved_option_use_Japanese_tokeniser();

    lookup.CurrentResultLimit = ko.observable(45);
    lookup.backendWorker = new fake_backend_worker();

    lookup.backendWorker.addListener('saveOperationsToStorage.event', function(toStoreOperations) 
    {
        lookup.save_Operations_to_storage(toStoreOperations);
    });


    lookup.check_platform();

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
        lookup.operationsToAddGradually_timer = setTimeout(lookup.operationsToAddGradually_handler, lookup.operationsToAddGradually_miliseconds);
        
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


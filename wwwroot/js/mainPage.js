

function ConnectedNotesViewModel()
{
    var self = this;
    lookup.actions = 
    {
        NoteUpdated: 'NoteUpdated',
        ConnectionUpdated: 'ConnectionUpdated',
        NoteAdded: 'NoteAdded',
        NoteDeleted: 'NoteDeleted',
        ConnectionAdded: 'ConnectionAdded',
        ConnectionDeleted: 'ConnectionDeleted',
        PositionsUpdated: 'PositionsUpdated',
        HealthCheckRequest: 'HealthCheckRequest',
        HealthCheckIdsProposal: 'HealthCheckIdsProposal'

    };

    lookup.defineLocalStorage();

    lookup.backgroundApplySaved();

    lookup.hashCards = {};

    lookup.populateColorPresets();

    lookup.backendWorker = new lookup.QueryableWorker("js/backend-worker.js?v=" + new Date().toString());


    lookup.backendWorker.addListener('saveItemsToStorage.event', function(toStoreNotes, toStoreConnections) 
    {
        lookup.saveItemsToStorage(toStoreNotes, toStoreConnections);
    });

    lookup.backendWorker.addListener('saveOperationsToStorage.event', function(toStoreOperations, free_Operation_Index) 
    {
        lookup.save_Operations_to_storage(toStoreOperations, free_Operation_Index);
    });


    lookup.LimitedFilteredOperations = ko.observableArray([]);
    lookup.backendWorker.addListener('LimitedFilteredOperations.changed.event', function(cards) 
    {
        lookup.LimitedFilteredOperations.removeAll();
        var processed = ko.utils.arrayMap(cards, function(item) {
            var operation = new lookup.model_Operation(item)
            return operation;
        });
        
        ko.utils.arrayPushAll(lookup.LimitedFilteredOperations, processed);
    });

    lookup.hidden_operations_count = ko.observable(0);
    lookup.backendWorker.addListener('NumberOfHiddenOperations.changed', function(length) 
    {
        lookup.hidden_operations_count(length);
    });

    lookup.ExtendCurrentResultLimit = function()
    {
        lookup.backendWorker.sendQuery("ExtendCurrentResultLimit");
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




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

    lookup.hashCards = {};

    lookup.populateColorPresets();

    lookup.backendWorker = new lookup.QueryableWorker("js/backend-worker.js?v=" + new Date().toString());


    lookup.backendWorker.addListener('saveItemsToStorage.event', function(toStoreNotes, toStoreConnections) 
    {
        lookup.saveItemsToStorage(toStoreNotes, toStoreConnections);
    });

    lookup.LimitedFilteredCards = ko.observableArray([]);
    lookup.backendWorker.addListener('LimitedFilteredCards.changed.event', function(cards) 
    {
        lookup.LimitedFilteredCards.removeAll();
        var processed = ko.utils.arrayMap(cards, function(item) {
            var node = new lookup.model_Node(item.Note_serialized)
            item.Note = node;
            var card = new lookup.model_Card(item);
            return card;
        });
        
        ko.utils.arrayPushAll(lookup.LimitedFilteredCards, processed);
    });

    lookup.LimitedFilteredCards
        .extend({ rateLimit: 150 });


    lookup.ReversedListOfCards = ko.pureComputed(function()
    {
        return lookup.LimitedFilteredCards().reverse();
    });


    lookup.ReversedListOfCards
        .subscribe(function(changes)
            {
                
                console.log("reversed list  changed")

            });

    

    lookup.filtered_cards_length = ko.observable(0);


    

    lookup.backendWorker.addListener('FilteredCards.length.changed', function(length) 
    {
        console.log('FilteredCards.length.changed: ' + length);
        lookup.filtered_cards_length(length);
    });


    lookup.ShowExtendCurrentResultLimit = ko.pureComputed(function()
    {
        return lookup.filtered_cards_length() > lookup.CurrentResultLimit();
    });

    lookup.NumberOfHiddenSearhItems = ko.pureComputed(function()
    {
        return lookup.filtered_cards_length() - lookup.CurrentResultLimit();
    });


    lookup.CurrentResultLimit = ko.observable(45);

    lookup.ResetCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(45);
    };

    lookup.ExtendAmountForCurrentResultLimit = 45;


    lookup.ExtendCurrentResultLimit = function()
    {
        var currentCards = lookup.LimitedFilteredCards();
        if(currentCards.length > 0)
        {
            var bottomCard = currentCards[0];
            lookup.onListChanged_set_scrollToCardAfter(bottomCard);
        }
        lookup.CurrentResultLimit(lookup.CurrentResultLimit() + lookup.ExtendAmountForCurrentResultLimit);
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




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

    lookup
        .history
        .extend(
            { 
                rateLimit: 500 
            }
        )
        .subscribe(
            function(changes) {
                if(changes && changes.length > 0)
                {

                    var addedChanges = ko.utils.arrayFilter(changes, function(item){ 
                            return item.status == "added";
                        } 
                    );

                    if(addedChanges && addedChanges.length > 0 ) {

                        var toStoreNotes = ko.utils.arrayMap(lookup.Notes(), function(item) {
                            return item.ConvertToJs();
                        });
                        var toStoreConnections = ko.utils.arrayMap(lookup.Connections(), function(item) {
                            return item.ConvertToJs();
                        });

                        toStoreNotes = toStoreNotes
                            .sort(
                                function(left, right)
                                {
                                    if(left.createDate === right.createDate)
                                    {
                                        return 0;
                                    }
                                    else
                                    {
                                        if(left.createDate < right.createDate)
                                        {
                                            return -1;
                                        }
                                        else
                                        {
                                            return 1;
                                        }
                                    }
                                }
                            );
                       
                        
                        lookup.localStorage.setItem("Notes", JSON.stringify(toStoreNotes));
                        lookup.localStorage.setItem("Connections", JSON.stringify(toStoreConnections));


                        var filteredChanges = ko.utils.arrayFilter(addedChanges, function(item){ 
                                return item.value.action != lookup.actions.PositionsUpdated 
                                    && item.value.action != ""
                                    && !item.value.isFromOuterSpace;
                            } 
                        );

                        console.log("before filter: " + filteredChanges.length);

                         // filter changes here by same id
                        var filter = {};
                         // if foreach is sequential filter will keep latest index available for id
                        ko.utils.arrayForEach(filteredChanges,
                             function(item, index)
                             {
                                 if(item.value.data && item.value.data.id)
                                 {
                                     filter[item.value.action + item.value.data.id] = index;
                                 }
                             }
                         );
                         // therefore need to keep only latest item with same id, because there is rateLimit not all values will be published to other devices
                        filteredChanges = ko.utils.arrayFilter(filteredChanges,
                             function(item, index)
                             {
                                 if(item.value.data && item.value.data.id)
                                 {
                                     return filter[item.value.action + item.value.data.id] == index;
                                 }
                             }
                        );

                        console.log("after filter: " + filteredChanges.length);

                        lookup.history.removeAll();
                    

                    }
                }
            }
            ,null
            ,"arrayChange"
        );




    lookup.FilteredCards = ko.pureComputed(function() {
        var taken = 0;
        // dummy call to get updates for dictionary
        var version_of_dictionary = lookup.dictionary_of_notes_updated();
        var search_query = lookup.SearchNotesQuery().trim();
        if(search_query.length === 0)
        {
            return lookup.composedCards();
        }
        else
        {
            var found = lookup.dictionary_of_notes[search_query];
            if(typeof(found) !== 'undefined')
            {
                var result = [];
                for( var note_id in found) {
                    if(found[note_id])
                    {
                        result.push(lookup.findCardByMainNodeId(note_id));
                    }
                }
                return result;
            }
            else
            {
                return [];
            }

            


        }
        
    });
    
    lookup.sortedByDateCards = ko.pureComputed(function()
    {
        return lookup
            .FilteredCards()
            .sort(
                function(left, right)
                {
                    if(left.Note.createDate === right.Note.createDate)
                    {
                        return 0;
                    }
                    else
                    {
                        if(left.Note.createDate < right.Note.createDate)
                        {
                            return 1;
                        }
                        else
                        {
                            return -1;
                        }
                    }
                }
            );
    });

    // the idea is that cards without tags should not be displayed unless they are root
    lookup.filteredOutLeafs = ko.pureComputed(
        function()
        {
            return ko.utils.arrayFilter
            (
                lookup.sortedByDateCards(),
                function(item, index)
                {
                    return item.isRoot || item.hasTags || item.Note.text().length >= 20;
                    
                }


            );

        }
    );
   

    lookup.CurrentResultLimit = ko.observable(45);

    lookup.ResetCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(45);
    };

    lookup.LimitedFilteredCards = ko.pureComputed(function()
    {
        return lookup.filteredOutLeafs().slice(0, lookup.CurrentResultLimit());
    });

    lookup.ReversedListOfCards = ko.pureComputed(function()
    {
        return lookup.LimitedFilteredCards().reverse();
    });


    lookup.ReversedListOfCards
        .subscribe(function(changes)
            {
                
                console.log("reversed list  changed")

            });


    lookup.ShowExtendCurrentResultLimit = ko.pureComputed(function()
    {
        return lookup.FilteredCards().length > lookup.CurrentResultLimit();
    });

    lookup.NumberOfHiddenSearhItems = ko.pureComputed(function()
    {
        return lookup.FilteredCards().length - lookup.CurrentResultLimit();
    });

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


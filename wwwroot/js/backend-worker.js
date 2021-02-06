importScripts("../lib/knockout/knockout-latest.debug.js")
importScripts("lookup.js")
importScripts("populateColorPresets.js")

importScripts("model_Card.js")
importScripts("model_ColorPreset.js")
importScripts("model_Connection.js")
importScripts("model_Node.js")
importScripts("model_Operation.js")
importScripts("get_Operation_Index.js")
importScripts("migrate_to_Operations.js")
importScripts("Instanciate_model_node.js")
importScripts("GetRandomColor.js")
importScripts("Instanciate_model_connection.js")
importScripts("findNodeById.js")
importScripts("SearchNotesQuery.js")
importScripts("findCardByMainNodeId.js")
importScripts("populate_Operations.js")



importScripts("populate.js")

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

lookup.hashCards = {};

lookup.populateColorPresets();

lookup.CurrentResultLimit = ko.observable(45);


lookup
    .Operations
    .extend(
        { 
            rateLimit: 500 
        }
    )
    .subscribe(
        on_operations_changed,
        null, 
        "arrayChange"
    );

    lookup.FilteredOperations = ko.pureComputed
        (
            function()
            {
                var search_query = lookup.SearchNotesQuery().trim().toLowerCase();
                if(search_query.length === 0)
                {
                    return lookup.Operations();
                }
                else
                {
                    // classic approach
                    return ko.utils.arrayFilter
                        (
                            lookup.Operations(),
                            function(item, index)
                            {
                                if(item.name === 'create')
                                {
                                    var searchResult = item.data.text.toLowerCase().indexOf(search_query) >= 0;
                                    return searchResult;
                                }
                                else
                                {
                                    if(item.name === 'quote')
                                    {
                                        var searchResult1 = item.data.quoted.text.toLowerCase().indexOf(search_query) >= 0;
                                        var searchResult2 = item.data.current.text.toLowerCase().indexOf(search_query) >= 0;
                                        return searchResult1 || searchResult2;
                                    }
                                    else
                                    {
                                        return false;
                                    }
                                }
                            }
                        );
                }
            }
        );

    lookup.FilteredOperations
        .subscribe(function(changes)
            {
              reply('FilteredCards.length.changed', lookup.FilteredOperations().length);
            });
    
    lookup.LimitedFilteredOperations = ko.pureComputed(function()
            {
                return lookup.FilteredOperations().slice(0, lookup.CurrentResultLimit());
            });

    lookup.LimitedFilteredOperations
        .subscribe(function(changes)
            {
                console.log('LimitedFilteredOperations changed');
                var toProcess = lookup.LimitedFilteredOperations();
                var toSend = ko.utils.arrayMap(toProcess, function(item) {
                    return item.ConvertToJs();
                });
                reply('LimitedFilteredOperations.changed.event', toSend);

            });




    lookup.FilteredCards = ko.pureComputed(function() {
        var taken = 0;
        // dummy call to get updates for dictionary
        var version_of_dictionary = lookup.dictionary_of_notes_updated();
        var search_query = lookup.SearchNotesQuery().trim().toLowerCase();
        if(search_query.length === 0)
        {
            return lookup.composedCards();
        }
        else
        {
            if(version_of_dictionary === 0)
            {
                // classic approach
                return ko.utils.arrayFilter
                (
                    lookup.composedCards(), 
                    function(item, index)
                        { 
                            if(taken >=  lookup.CurrentResultLimit() + lookup.ExtendAmountForCurrentResultLimit)
                            {
                                return false;
                            }
                            var resultOfSearchQuery = item.IsForSearchResult(search_query);
                            if(resultOfSearchQuery)
                            {
                                taken++;
                            }
                            
                            return resultOfSearchQuery;
                            
                            
                        }
                );

            }
            else
            {
                // dictionary approach
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
   

    lookup.FilteredCards
        .subscribe(function(changes)
            {
              reply('FilteredCards.length.changed', lookup.FilteredCards().length);
            });

    

    

    lookup.ResetCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(45);
    };

    lookup.LimitedFilteredCards = ko.pureComputed(function()
    {
        return lookup.filteredOutLeafs().slice(0, lookup.CurrentResultLimit());
    });

    lookup.LimitedFilteredCards
        .extend({ rateLimit: 150 });

    lookup.LimitedFilteredCards
        .subscribe(function(changes)
            {
                console.log('LimitedFilteredCards changed');
                var toProcess = lookup.LimitedFilteredCards();
                var toSend = ko.utils.arrayMap(toProcess, function(item) {
                  return item.ConvertToJs();
                });
                reply('LimitedFilteredCards.changed.event', toSend);

            });

    lookup.ReversedListOfCards = ko.pureComputed(function()
    {
        return lookup.LimitedFilteredCards().reverse();
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



function on_operations_changed(changes)
{
    if (changes && changes.length > 0) {
        var addedChanges = ko.utils.arrayFilter
            (
                changes, 
                function (item) 
                {
                    return item.status == "added"
                }
            );

        if (addedChanges && addedChanges.length > 0) {
            var toStoreOperations = ko.utils.arrayMap(lookup.Operations(), function (item) {
                return item.ConvertToJs()
            })

            toStoreOperations = toStoreOperations
                .sort(
                    function (left, right) {
                        if (left.time === right.time) {
                            return 0
                        }

                        else {
                            if (left.time < right.time) {
                                return -1
                            }

                            else {
                                return 1
                            }
                        }
                    }
                )


            reply('saveOperationsToStorage.event', toStoreOperations, lookup.free_Operation_Index)
        }
    }
};


// system functions

function defaultReply(message) {
  // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
  // do something
}

function reply() {
  if (arguments.length < 1) { throw new TypeError('reply - not enough arguments'); return; }
  postMessage({ 'queryMethodListener': arguments[0], 'queryMethodArguments': Array.prototype.slice.call(arguments, 1) });
}

onmessage = function(oEvent) {
  if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty('queryMethod') && oEvent.data.hasOwnProperty('queryMethodArguments')) {
    lookup[oEvent.data.queryMethod].apply(self, oEvent.data.queryMethodArguments);
    reply(oEvent.data.queryMethod + '.finished');
  } else {
    defaultReply(oEvent.data);
  }
};

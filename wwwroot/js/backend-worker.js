importScripts("../lib/knockout/knockout-latest.debug.js")
importScripts("lookup.js")
importScripts("populateColorPresets.js")

importScripts("model_Card.js")
importScripts("model_ColorPreset.js")
importScripts("model_Connection.js")
importScripts("model_Node.js")
importScripts("Instanciate_model_node.js")
importScripts("GetRandomColor.js")
importScripts("Instanciate_model_connection.js")
importScripts("findNodeById.js")
importScripts("SearchNotesQuery.js")
importScripts("findCardByMainNodeId.js")



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
                       
                        
                        reply('saveItemsToStorage.event', toStoreNotes, toStoreConnections);


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

    

    lookup.CurrentResultLimit = ko.observable(45);

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
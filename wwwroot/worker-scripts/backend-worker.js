importScripts("../lib/knockout/knockout-latest.debug.js" + "?v=" + new Date().toString())
importScripts("../js/lookup.js"  + "?v=" + new Date().toString())
importScripts("../js/populateColorPresets.js" + "?v=" + new Date().toString())
importScripts("../js/model_Card.js" + "?v=" + new Date().toString())
importScripts("../js/model_ColorPreset.js" + "?v=" + new Date().toString())
importScripts("../js/model_Connection.js" + "?v=" + new Date().toString())
importScripts("../js/model_Node.js" + "?v=" + new Date().toString())
importScripts("../js/model_Operation.js" + "?v=" + new Date().toString())
importScripts("../js/get_Operation_Index.js" + "?v=" + new Date().toString())
importScripts("../js/migrate_to_Operations.js" + "?v=" + new Date().toString())
importScripts("../js/Instanciate_model_node.js" + "?v=" + new Date().toString())
importScripts("../js/GetRandomColor.js" + "?v=" + new Date().toString())
importScripts("../js/Instanciate_model_connection.js" + "?v=" + new Date().toString())
importScripts("../js/findNodeById.js" + "?v=" + new Date().toString())
importScripts("../js/SearchNotesQuery.js" + "?v=" + new Date().toString())
importScripts("../js/findCardByMainNodeId.js" + "?v=" + new Date().toString())
importScripts("../js/populate_Operations.js" + "?v=" + new Date().toString())
importScripts("../js/Operation_was_added.js" + "?v=" + new Date().toString())
importScripts("../js/demo_notes_en.js" + "?v=" + new Date().toString())
importScripts("../js/populate.js" + "?v=" + new Date().toString())
importScripts("../js/option_show_help_demo_notes.js" + "?v=" + new Date().toString())
importScripts("../js/find_aliases.js" + "?v=" + new Date().toString())
importScripts("../js/import_Operations.js" + "?v=" + new Date().toString())

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


// in Operations fisrt ones are the oldest one, or at least they will be after first save
lookup.Operations = ko.observableArray([]);

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

    lookup.Operations_And_Demo = ko.pureComputed(
        function()
        {
            const show_demo_notes = lookup.option_show_help_demo_notes();
            if(lookup.Operations().length == 0 || show_demo_notes)
            {
                var demo_operations = ko.utils.arrayMap(
                    lookup.demo_notes_en,
                    function(item)
                    {
                        return new lookup.model_Operation(item);
                    }
                );
                var combined_result = [].concat(demo_operations, lookup.Operations());
                return combined_result;
            }
            else
            {
                return lookup.Operations();
            }

        }
    );

    

    lookup.FilteredOperations = ko.pureComputed
        (
            function()
            {                
                var search_query = lookup.SearchNotesQuery().trim().toLowerCase();
                var operationsToWorkWith = lookup.Operations_And_Demo();
                if(search_query.length === 0)
                {
                    return operationsToWorkWith;
                }
                else
                {
                    const first_jump = lookup.find_aliases(search_query);
                    const second_jump = first_jump.flatMap(first => lookup.find_aliases(first));
                    var aliases = [].concat([search_query], first_jump, second_jump)
                        .filter(query => query.length > 0);
                    var reduced = aliases.reduce((ac, elem) => { ac[elem] = true; return ac;}, {});
                    aliases = Object.getOwnPropertyNames(reduced);
                    console.log(aliases);
                    // classic search approach
                    return ko.utils.arrayFilter
                    (
                        operationsToWorkWith,
                        function(item, index)
                        {
                            if(item.name === 'create')
                            {
                                var searchResult =  aliases.some( query => item.data.text.toLowerCase().indexOf(query) >= 0);
                                return searchResult;
                            }
                            else
                            {
                                if(item.name === 'quote' || item.name === 'quote-edit')
                                {
                                    var searchResult1 = aliases.some( query => item.data.quoted.text.toLowerCase().indexOf(query) >= 0);
                                    var searchResult2 = aliases.some( query => item.data.current.text.toLowerCase().indexOf(query) >= 0);
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
                var startIndex = lookup.FilteredOperations().length - lookup.CurrentResultLimit()
                if(startIndex < 0)
                {
                    startIndex = 0;
                }
                return lookup.FilteredOperations().slice(startIndex);
            });

    lookup.NumberOfHiddenOperations = ko.pureComputed(function()
    {
        return lookup.FilteredOperations().length - lookup.LimitedFilteredOperations().length;
    });

    lookup.NumberOfHiddenOperations
        .subscribe(function(changes)
            {
                reply('NumberOfHiddenOperations.changed', lookup.NumberOfHiddenOperations());
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

    lookup.ResetCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(45);
    };

    lookup.ExtendAmountForCurrentResultLimit = 45;


    lookup.ExtendCurrentResultLimit = function()
    {
        lookup.CurrentResultLimit(lookup.CurrentResultLimit() + lookup.ExtendAmountForCurrentResultLimit);
    };

    lookup.SetCurrentResultLimit = function(value)
    {
        lookup.CurrentResultLimit(value);
    };

    lookup.CurrentResultLimit
        .subscribe(function(changes)
            {
                reply('CurrentResultLimit.changed', lookup.CurrentResultLimit());
            });



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
            var toStoreOperations = ko.utils.arrayMap
            (
                lookup.Operations(), 
                function (item) {
                return item.ConvertToJs()
                }
            );

            toStoreOperations = toStoreOperations
                .sort(
                    function (left, right) {
                        if (left.time === right.time) {
                            return 0;
                        }

                        else {
                            if (left.time < right.time) {
                                return -1;
                            }

                            else {
                                return 1;
                            }
                        }
                    }
                );


            reply('saveOperationsToStorage.event', toStoreOperations);
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

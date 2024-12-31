function fake_backend_worker()
{
    var self = this;
<lisperanto-just-paste src="js/lookup.js"  />
<lisperanto-just-paste src="js/cards_container_height.js"  />
<lisperanto-just-paste src="js/populateColorPresets.js" />
<lisperanto-just-paste src="js/model_Card.js" />
<lisperanto-just-paste src="js/model_ColorPreset.js" />
<lisperanto-just-paste src="js/model_Operation.js" />
<lisperanto-just-paste src="js/migrate_to_Operations.js" />
<lisperanto-just-paste src="js/GetRandomColor.js" />
<lisperanto-just-paste src="js/findNodeById.js" />
<lisperanto-just-paste src="js/SearchNotesQuery.js" />
<lisperanto-just-paste src="js/populate_Operations.js" />
<lisperanto-just-paste src="js/Operation_was_added.js" />
<lisperanto-just-paste src="js/demo_notes_en.js" />
<lisperanto-just-paste src="js/empty_note.js" />
<lisperanto-just-paste src="js/option_show_help_demo_notes.js" />
<lisperanto-just-paste src="js/option_use_Japanese_tokeniser.js" />
<lisperanto-just-paste src="js/import_Operations.js" />
<lisperanto-just-paste src="js/populate_Aliases.js" />
<lisperanto-just-paste src="js/regenerate_Aliases.js" />
<lisperanto-just-paste src="js/define_Aliases_if_needed.js" />
<lisperanto-just-paste src="js/add_Alias.js" />
<lisperanto-just-paste src="js/globalOffsets.js" />





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

    lookup.Operations_And_Options = ko.pureComputed(
        function()
        {
            const show_demo_notes = lookup.option_show_help_demo_notes();
            const use_Japanese_tokeniser = lookup.option_use_Japanese_tokeniser(); // fictional use of option to refresh observable on change of the option
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
            if (use_Japanese_tokeniser)
            {
                var combined_result = [].concat([new lookup.model_Operation(lookup.empty_note)], lookup.Operations()); // combining with empty note, hope it will refresh set
                return combined_result;
            }
            
            return lookup.Operations();
        }
    );

    

    lookup.FilteredOperations = ko.pureComputed
        (
            function()
            {                
                var search_query = lookup.SearchNotesQuery().trim().toLowerCase();
                var operationsToWorkWith = lookup.Operations_And_Options();
                if(search_query.length === 0)
                {
                    return operationsToWorkWith;
                }
                else
                {
                    // [2022-01-09] Aliases should search only by backward-index (from word to note)
                    // [2022-01-09] if search query matches any present word then it should search by word-backward-index
                    var aliases = [search_query]
                        .filter(query => query.length > 0);
                    var reduced = aliases.reduce((ac, elem) => { ac[elem] = true; return ac;}, {});
                    aliases = Object.getOwnPropertyNames(reduced);
                    // classic search approach
                    const filtered_operations = ko.utils.arrayFilter
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
                    return filtered_operations;
                }
            }
        );

    lookup.FilteredOperations
        .subscribe(function(changes)
            {
              self.reply('FilteredCards.length.changed', lookup.FilteredOperations().length);
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
                self.reply('NumberOfHiddenOperations.changed', lookup.NumberOfHiddenOperations());
            });

    lookup.LimitedFilteredOperations
        .subscribe(function(changes)
            {
                console.log('LimitedFilteredOperations changed');
                var toProcess = lookup.LimitedFilteredOperations();
                var toSend = ko.utils.arrayMap(toProcess, function(item) {
                    return item.ConvertToJs();
                });
                self.reply('LimitedFilteredOperations.changed.event', toSend);

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
                self.reply('CurrentResultLimit.changed', lookup.CurrentResultLimit());
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


            self.reply('saveOperationsToStorage.event', toStoreOperations);
        }
    }
};


// system functions
this.listeners = {};

this.reply = function(eventName, eventArgs) {
  if (eventName in this.listeners)
  {
    this.listeners[eventName].forEach(function(item, index) {
        item(eventArgs);
        });
  }
};


this.addListener = function(eventName, func)
{
    if (eventName in this.listeners)
    {
        this.listeners[eventName].push(func);
    }
    else
    {
        this.listeners[eventName] = [func];
    }
}
this.sendQuery = function(queryMethod, queryMethodArguments)
{
    lookup[queryMethod](queryMethodArguments);
    self.reply(queryMethod + '.finished');
};
};

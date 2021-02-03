lookup.SearchNotesQuery = ko.observable("");
lookup.SearchNotesQuery
    .extend({ rateLimit: 150 });

lookup.SearchNotesQuery
    .subscribe(function()
    {
        if(typeof(lookup.backendWorker) !== 'undefined')
        {
            lookup.backendWorker.sendQuery('SearchNotesQuery', lookup.SearchNotesQuery());

        }
        
    });
lookup.SearchNotesQuery = ko.observable("");
lookup.SearchNotesQuery
    .extend({ rateLimit: 150 });
lookup.SearchNotesQuery
    .subscribe(function(changes)
    {
        lookup.onListChanged_set_scrollToLatestCard();
    });
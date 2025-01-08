
lookup
    .SearchNotesQuery
    .subscribe(function(value)
    {
        lookup.reset_current_search_context(value);
    });
lookup.CreateNoteFromSearchQuery = function() {
    var data = 
    {
        text: lookup.SearchNotesQuery().trim(),
        color: lookup.colorOfNextQuote()
    };

    lookup.colorOfNextQuote(lookup.GetRandomColor().Color());
    lookup.SearchNotesQuery("");
    if(data.text.length > 0)
    {
        lookup.resetGlobalOffsetY();
        var operation = 
        {
            name: 'create',
            data: data,
            time: new Date().toISOString()
        };
        lookup.backendWorker.sendQuery('Operation_was_added', operation);
    }
};
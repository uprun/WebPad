lookup.CreateNoteFromSearchQuery = function() {
    var data = 
    {
        text: lookup.SearchNotesQuery().trim(),
        color: lookup.GetRandomColor().Color()
    };
    lookup.SearchNotesQuery("");
    if(data.text.length > 0)
    {
        lookup.onListChanged_set_scrollToLatestCard();
        var operation = 
        {
            id: 
            {
                is_local: true,
                prefix: "to-be-defined"
            },
            name: 'create',
            data: data,
            time: new Date().toISOString()
        };
        lookup.backendWorker.sendQuery('Operation_was_added', operation);
    }
};
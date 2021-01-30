lookup.CreateNoteFromSearchQuery = function() {
    var obj = {
        text: lookup.SearchNotesQuery().trim()
        };
    lookup.CreateNote(obj, function(added)
        {
            console.log('create');
            lookup.SearchNotesQuery("");
            lookup.jumpToCardOnCreate(added);
        }
    );
};
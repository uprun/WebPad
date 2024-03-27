lookup.pushToSearchNotesQueryText = function(query)
{
    var currentValue = lookup.SearchNotesQuery().trim();

    
    var visible_note_id = lookup.LimitedFilteredOperations().findIndex(e => e.visible());
    var note_data_stringified = undefined;
    var note_global_bottom = 0;
    if (visible_note_id >= 0)
    {
        var actual_note = lookup.LimitedFilteredOperations()[visible_note_id];
        note_data_stringified = JSON.stringify( actual_note.ConvertToJs() );
        note_global_bottom = actual_note.globalBottom();
    }
    
    lookup.stackSearchNotesQuery.push(
        {
            query: currentValue,
            scrollPosition: lookup.globalOffsetY(),
            amountOfCardsLimit: lookup.CurrentResultLimit(),
            note_data_stringified: note_data_stringified,
            note_global_bottom: note_global_bottom
        }
    );

    lookup.first_to_render_note_data_stringified = undefined;
    lookup.first_to_render_note_globalBottom = 0;


    var newQuery = query.trim();
    history.pushState({ query: newQuery }, "#" + newQuery, "?hash_tag=" + newQuery);
    lookup.SearchNotesQuery(newQuery);
    lookup.ResetCurrentResultLimit();
};
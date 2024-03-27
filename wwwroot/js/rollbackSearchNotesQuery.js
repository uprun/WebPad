lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.rollbackSearchNotesQuery = function()
{
    if(lookup.stackSearchNotesQuery().length > 0)
    {
        previousQuery = lookup.stackSearchNotesQuery.pop();
        lookup.globalOffsetY(previousQuery.scrollPosition);
        lookup.SearchNotesQuery(previousQuery.query);
        lookup.SetCurrentResultLimit(previousQuery.amountOfCardsLimit)
        lookup.first_to_render_note_data_stringified = previousQuery.note_data_stringified;
        lookup.first_to_render_note_globalBottom = previousQuery.note_global_bottom;
    }
    else
    {
        lookup.SearchNotesQuery("");
        lookup.resetGlobalOffsetY();
        lookup.first_to_render_note_data_stringified = undefined;
        lookup.first_to_render_note_globalBottom = 0;

    }
    
};
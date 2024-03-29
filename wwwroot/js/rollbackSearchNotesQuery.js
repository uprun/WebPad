lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.rollbackSearchNotesQuery = function()
{
    if(lookup.stackSearchNotesQuery().length > 0)
    {
        previousQuery = lookup.stackSearchNotesQuery.pop();
        lookup.globalOffsetY(previousQuery.scrollPosition);
        lookup.SearchNotesQuery(previousQuery.query);
        lookup.SetCurrentResultLimit(previousQuery.amountOfCardsLimit);
        lookup.restore_first_to_render_note_information(previousQuery);
    }
    else
    {
        lookup.SearchNotesQuery("");
        lookup.resetGlobalOffsetY();
        lookup.first_to_render_note_data_stringified = undefined;
        lookup.first_to_render_note_globalBottom = 0;

    }
    
};
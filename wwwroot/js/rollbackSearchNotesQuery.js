lookup.stackSearchNotesQuery = ko.observableArray([]);
lookup.rollbackSearchNotesQuery = function()
{
        lookup.SearchNotesQuery("");
        lookup.resetGlobalOffsetY();
        lookup.first_to_render_note_data_stringified = undefined;
        lookup.first_to_render_note_globalBottom = 0;
    
};
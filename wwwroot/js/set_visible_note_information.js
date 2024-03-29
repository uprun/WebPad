lookup.set_visible_note_information = function(current_scroll_state)
{
    current_scroll_state.note_data_stringified = undefined;
    current_scroll_state.note_global_bottom = 0;
    if (typeof(lookup) === "undefined") return;
    if (typeof(lookup.LimitedFilteredOperations) === "undefined") return;
    if (typeof(lookup.LimitedFilteredOperations_below) === "undefined") return;

    const cards = lookup.LimitedFilteredOperations().concat(lookup.LimitedFilteredOperations_below());
    var visible_note_id = cards.findIndex(e => e.visible());
    var note_data_stringified = undefined;
    var note_global_bottom = 0;
    if (visible_note_id >= 0)
    {
        var actual_note = cards[visible_note_id];
        note_data_stringified = JSON.stringify( actual_note.ConvertToJs() );
        note_global_bottom = actual_note.offset_bottom();
    }

    current_scroll_state.note_data_stringified = note_data_stringified;
    current_scroll_state.note_global_bottom = note_global_bottom;
};
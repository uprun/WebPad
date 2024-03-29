lookup.pushToSearchNotesQueryText = function(query)
{
    var currentValue = lookup.SearchNotesQuery().trim();

    let current_scroll_state = {
        query: currentValue,
        scrollPosition: lookup.globalOffsetY(),
        amountOfCardsLimit: lookup.CurrentResultLimit()
    };

    lookup.set_visible_note_information(current_scroll_state);

    
    
    
    
    lookup.stackSearchNotesQuery.push(
        current_scroll_state
    );

    lookup.first_to_render_note_data_stringified = undefined;
    lookup.first_to_render_note_globalBottom = 0;


    var newQuery = query.trim();
    history.pushState({ query: newQuery }, "#" + newQuery, "?hash_tag=" + newQuery);
    lookup.SearchNotesQuery(newQuery);
    lookup.ResetCurrentResultLimit();
};
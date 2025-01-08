lookup.search_status_message = ko.observable("");
lookup.update_search_status_message = function()
{
    lookup.search_status_message(`Searching ${lookup.current_search_context.single_search_index + 1} out of ${lookup.current_search_context.mupliple_searches.length} smaller searches`);
};
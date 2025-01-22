lookup.Operations_And_Options = ko.pureComputed(
    function()
    {
        var demo_operations = ko.utils.arrayMap(
            lookup.demo_notes_en,
            function(item)
            {
                return new lookup.model_Operation(item);
            }
        );
        var combined_result = [].concat(demo_operations, lookup.Operations());
        return combined_result;
    }
);

lookup.Operations_And_Options.subscribe(function() {
    lookup.reset_current_search_context(lookup.SearchNotesQuery());
});
lookup.Operations_And_Options = ko.pureComputed(
    function()
    {
        const show_demo_notes = lookup.option_show_help_demo_notes();
        if(lookup.Operations().length == 0 || show_demo_notes)
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
        
        return lookup.Operations();
    }
);

lookup.Operations_And_Options.subscribe(function() {
    lookup.reset_current_search_context(lookup.SearchNotesQuery());
});
lookup.Operations_And_Options = ko.pureComputed(
    function()
    {
        const show_demo_notes = lookup.option_show_help_demo_notes();
        const use_Japanese_tokeniser = lookup.option_use_Japanese_tokeniser(); // fictional use of option to refresh observable on change of the option
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
        if (use_Japanese_tokeniser)
        {
            var combined_result = [].concat([new lookup.model_Operation(lookup.empty_note)], lookup.Operations()); // combining with empty note, hope it will refresh set
            return combined_result;
        }
        
        return lookup.Operations();
    }
);

lookup.Operations_And_Options.subscribe(function() {
    lookup.reset_current_search_context(lookup.SearchNotesQuery());
});
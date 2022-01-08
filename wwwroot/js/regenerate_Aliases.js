lookup.regenerate_Aliases = function()
    {
        // backend-worker context
        lookup.define_Aliases_if_needed();
        var to_process = lookup.Operations();
        to_process.forEach(element => {
            lookup.process_potential_Alias(element);
        });
    };

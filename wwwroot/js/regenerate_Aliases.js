lookup.regenerate_Aliases = function()
    {
        // backend-worker context
        lookup.define_Aliases_if_needed();
        lookup.reply_from_backend_worker('saveAliasesToStorage.event', lookup.Aliases);
    };

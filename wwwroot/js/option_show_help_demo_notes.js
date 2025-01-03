lookup.option_show_help_demo_notes = ko.observable(false);
lookup.set_option_show_help_demo_notes_to_true = function() 
{
    if (typeof(lookup) === "undefined") return;
    if (typeof(lookup.localStorage) === "undefined") return;
    lookup.option_show_help_demo_notes(true);
    lookup.localStorage["option_show_help_demo_notes"] = true;
};

lookup.set_option_show_help_demo_notes_to_false = function() 
{
    if (typeof(lookup) === "undefined") return;
    if (typeof(lookup.localStorage) === "undefined") return;
    lookup.option_show_help_demo_notes(false);
    lookup.localStorage["option_show_help_demo_notes"] = false;
};

lookup.apply_saved_option_show_help_demo_notes = function() 
{
    var stored = lookup.localStorage["option_show_help_demo_notes"] === "true";
    lookup.option_show_help_demo_notes(stored);
};
lookup.option_show_help_demo_notes = ko.observable(false);
lookup.set_option_show_help_demo_notes_to_true = function() 
{
    lookup.option_show_help_demo_notes(true);
    lookup.localStorage["option_show_help_demo_notes"] = true;
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.set_option_show_help_demo_notes_to_false = function() 
{
    lookup.option_show_help_demo_notes(false);
    lookup.localStorage["option_show_help_demo_notes"] = false;
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.apply_saved_option_show_help_demo_notes = function() 
{
    var stored = lookup.localStorage["option_show_help_demo_notes"] === "true";
    lookup.option_show_help_demo_notes(stored);
    lookup.send_to_worker_update_for_option_show_help_demo_notes();
};

lookup.for_worker_apply_changes_in_option_show_help_demo_notes = function(newValue)
{
    lookup.option_show_help_demo_notes(newValue);
};

lookup.send_to_worker_update_for_option_show_help_demo_notes = function()
{
    if(typeof(lookup.backendWorker) !== 'undefined')
    {
        const valueToSend = lookup.option_show_help_demo_notes();
        lookup.backendWorker.sendQuery('for_worker_apply_changes_in_option_show_help_demo_notes', valueToSend);
    }
    
};
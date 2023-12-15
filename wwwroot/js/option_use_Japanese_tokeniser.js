lookup.option_use_Japanese_tokeniser = ko.observable(false);
lookup.set_option_use_Japanese_tokeniser_to_true = function() 
{
    lookup.option_use_Japanese_tokeniser(true);
    lookup.localStorage["option_use_Japanese_tokeniser"] = true;
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.set_option_use_Japanese_tokeniser_to_false = function() 
{
    lookup.option_use_Japanese_tokeniser(false);
    lookup.localStorage["option_use_Japanese_tokeniser"] = false;
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.apply_saved_option_use_Japanese_tokeniser = function() 
{
    var stored = lookup.localStorage["option_use_Japanese_tokeniser"] === "true";
    lookup.option_use_Japanese_tokeniser(stored);
    lookup.send_to_worker_update_for_option_use_Japanese_tokeniser();
};

lookup.for_worker_apply_changes_in_option_use_Japanese_tokeniser = function(newValue)
{
    lookup.option_use_Japanese_tokeniser(newValue);
};

lookup.send_to_worker_update_for_option_use_Japanese_tokeniser = function()
{
    if(typeof(lookup.backendWorker) !== 'undefined')
    {
        const valueToSend = lookup.option_use_Japanese_tokeniser();
        lookup.backendWorker.sendQuery('for_worker_apply_changes_in_option_use_Japanese_tokeniser', valueToSend);
    }
    
};
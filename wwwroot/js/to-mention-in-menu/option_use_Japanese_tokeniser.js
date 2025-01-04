lookup.option_use_Japanese_tokeniser = ko.observable(false);
lookup.set_option_use_Japanese_tokeniser_to_true = function() 
{
    lookup.option_use_Japanese_tokeniser(true);
    lookup.localStorage["option_use_Japanese_tokeniser"] = true;
};

lookup.set_option_use_Japanese_tokeniser_to_false = function() 
{
    lookup.option_use_Japanese_tokeniser(false);
    lookup.localStorage["option_use_Japanese_tokeniser"] = false;
};

lookup.apply_saved_option_use_Japanese_tokeniser = function() 
{
    var stored = lookup.localStorage["option_use_Japanese_tokeniser"] === "true";
    lookup.option_use_Japanese_tokeniser(stored);
};
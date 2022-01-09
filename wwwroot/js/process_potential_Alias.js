lookup.process_potential_Alias = function(operation) {
    // backend-worker context
    var text = ''; 
    if(operation.name === 'create')
    {
        text = operation.data.text;
    }
    if(operation.name === 'quote-edit')
    {
        // I might want to remove previous alias here, because this one is an edit
        text = operation.data.current.text;
        var to_remove = operation.data.quoted.text.toLowerCase().split(" ").filter(x => x.length > 0);
        lookup.remove_Alias(to_remove[0], to_remove[1]);
        lookup.remove_Alias(to_remove[1], to_remove[0]);
    }
    var splitted = text.toLowerCase().split(" ").filter(x => x.length > 0);
    if(splitted.length === 2)
    {
        lookup.add_Alias(splitted[0], splitted[1]);
        lookup.add_Alias(splitted[1], splitted[0]);
    }
    // send signal that operation was processed in order to store count of processed operations
    // so Aliases storage can be verified to be up to date
};
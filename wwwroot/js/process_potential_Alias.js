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
    }
    var splitted = text.toLowerCase().split(" ").filter(x => x.length > 0);
    if(splitted.length === 2)
    {
        lookup.perform_combination_for_Alias(splitted[0], splitted[1]);
    }
    // send signal that operation was processed in order to store count of processed operations
    // so Aliases storage can be verified to be up to date
};
lookup.Instanciate_model_connection = function(data)
    {
        data.textChangedHandler = function(changes, model) 
        {
            if(changes  
                //&& changes != model.label()
                )
            {
                var toSend = model.ConvertToJs();
                toSend.label = changes;
                lookup.pushToHistory({
                    action: lookup.actions.ConnectionUpdated,
                    data: toSend
                });
            }
        };
        var result = new lookup.model_Connection(data);
        return result;
    };
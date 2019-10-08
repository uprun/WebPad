lookup.Instanciate_model_node = function(data)
    {
        data.textChangedHandler = function(changes, model) 
        {
            if(changes 
                //&& changes != model.text()
                )
            {
                var toSend = model.ConvertToJs();
                toSend.text = changes;
                
                lookup.pushToHistory({
                        action: lookup.actions.NoteUpdated,
                        data: toSend
                    }
                );
            }
        };
        var result = new model_Node(data);
        return result;
    };
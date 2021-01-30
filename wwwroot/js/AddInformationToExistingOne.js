lookup.AddInformationToExistingOne = function(existing, information) {
        
    // block adding of extra information if it is empty
    if(typeof(information) !== 'undefined')
    {
        information = information.trim();
        if(information.length !== 0)
        {
            var obj = {
                text: information,
                textColor: lookup.GetRandomColor().Color(),
                hasIncomingConnection: true
            };
            lookup.CreateNote(obj, function(destination) { 
                lookup.ConnectNotes(existing.Note, destination);  
            });
        }

    } 
    
};
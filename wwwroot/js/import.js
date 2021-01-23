lookup.import = function()
{
    var selectedFiles = document.getElementById('importSnapshotFile').files;
    if(typeof(selectedFiles) !== 'undefined')
    {
        if(selectedFiles.length > 0)
        {
            var snapshotFile = selectedFiles[0];
            const reader = new FileReader();
            reader.onload = function(e) 
            { 
                var result = e.target.result; 
                var parsed = JSON.parse(result);
                if(typeof(parsed.Notes) !== 'undefined' && 
                typeof(parsed.Connections) !== 'undefined')
                {
                    var data = {};
                    data.notes = parsed.Notes;
                    data.connections = parsed.Connections
                    lookup.populate_reset_helpers();
                    lookup.populate(data);
                }
                
            }; 
            reader.readAsText(snapshotFile);
        }
    }

};
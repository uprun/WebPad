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
                if
                (
                    typeof(parsed.Notes) !== 'undefined' && 
                    typeof(parsed.Connections) !== 'undefined'
                )
                {
                    alert('Notes and Connections file is not supported anymore')
                }
                if(typeof(parsed.Operations) !== 'undefined')
                {
                    var operationsData = 
                    {
                        Operations: parsed.Operations
                    };
                    lookup.backendWorker.sendQuery('import_Operations', operationsData);
                }
                
            }; 
            reader.readAsText(snapshotFile);
        }
    }

};
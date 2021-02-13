lookup.export = function()
{
    var toExport = {};

    if(typeof(lookup.localStorage["Notes"]) !== 'undefined')
    {
        toExport.Notes = JSON.parse(lookup.localStorage.getItem("Notes"));
        toExport.Connections = JSON.parse(lookup.localStorage.getItem("Connections"));
    }
    if(typeof(lookup.localStorage["Operations"]) !== 'undefined')
    {
        toExport.Operations = JSON.parse(lookup.localStorage.getItem("Operations"));
    }

    
    var content = JSON.stringify(toExport);
    lookup.download(content, 'snapshot.txt', 'text/plain');

    
    


};

lookup.download = function(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
};

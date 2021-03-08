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
    


    if (window.cordova && cordova.platformId !== "browser") 
    {
        // document.addEventListener("deviceready", function () {
        //   // save file using codova-plugin-file
        // });
        lookup.Android_file_download(content, 'WebPad-snapshot.txt', 'text/plain');
    } 
    else
    {
        lookup.download(content, 'WebPad-snapshot.txt', 'text/plain');
    }
    
    


};

lookup.download = function(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
};


lookup.Android_file_download = function(content, fileName, contentType)
{
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dirEntry) {
        dirEntry.getFile(fileName, { create: true }, function (fileEntry) {
             fileEntry.createWriter(function (fileWriter) {

                 fileWriter.onwriteend = function (e) {
                     console.log('Write completed.');
                 };

                 fileWriter.onerror = function (e) {
                     console.log('Write failed: ' + e.toString());
                 };

                 // Create a new Blob and write it to log.txt.
                 var blob = new Blob([content], { type: contentType });

                 fileWriter.write(blob);

             }, errorHandler);
         });
     });
};

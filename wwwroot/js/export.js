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
    
    var dateTime = new Date();
    var fileName = "WebPad-snapshot-" + dateTime.toDateString() + ".txt";


    if (lookup.platform_is_cordova_android()) 
    {
        // document.addEventListener("deviceready", function () {
        //   // save file using codova-plugin-file
        // });
        lookup.Android_file_download(content, fileName, 'text/plain');
    } 
    else
    {
        lookup.download(content, fileName, 'text/plain');
    }
    
    


};

lookup.download = function(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
};

lookup.android_file_error_handler = function(error)
{
    alert(JSON.stringify(error));
};

lookup.Android_file_download = function(content, fileName, contentType)
{
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dirEntry) 
    {
        dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) 
        {
            lookup.Android_write_file(fileEntry, content, contentType);
            
        }, lookup.android_file_error_handler);        
     });
};

lookup.Android_write_file = function(fileEntry, content, contentType)
{
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file write...");
            alert( "Your notes are exported to: " + fileEntry.nativeURL);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        
        var dataObj = new Blob([content], { type: contentType });

        fileWriter.write(dataObj);
    });

};

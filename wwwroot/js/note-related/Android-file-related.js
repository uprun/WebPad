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
            // new attempt 2023-03-25 00:55 CET
            // var a = document.createElement("a");
            // a.href = fileEntry.nativeURL;
            // a.download = fileEntry.name;
            // a.click();
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        
        var dataObj = new Blob([content], { type: contentType });

        fileWriter.write(dataObj);
    });

};
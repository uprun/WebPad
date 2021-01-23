lookup.export = function()
{
    var toStoreNotes = ko.utils.arrayMap(lookup.Notes(), function(item) {
        return item.ConvertToJs();
    });
    var toStoreConnections = ko.utils.arrayMap(lookup.Connections(), function(item) {
        return item.ConvertToJs();
    });

    toStoreNotes = toStoreNotes
        .sort(
            function(left, right)
            {
                if(left.createDate === right.createDate)
                {
                    return 0;
                }
                else
                {
                    if(left.createDate < right.createDate)
                    {
                        return -1;
                    }
                    else
                    {
                        return 1;
                    }
                }
            }
        );

    var toExport = {
        Notes: toStoreNotes,
        Connections: toStoreConnections,
        localFreeIndex: lookup.freeLocalIndex

    };

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
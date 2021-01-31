lookup.saveItemsToStorage = function(toStoreNotes, toStoreConnections)
{
    lookup.localStorage.setItem("Notes", JSON.stringify(toStoreNotes));
    lookup.localStorage.setItem("Connections", JSON.stringify(toStoreConnections));
};

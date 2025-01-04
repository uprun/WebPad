lookup.save_Operations_to_storage = function(toStoreOperations)
{
    lookup.localStorage.setItem("Operations", JSON.stringify(toStoreOperations));
};

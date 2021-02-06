lookup.save_Operations_to_storage = function(toStoreOperations, free_Operation_Index)
{
    lookup.localStorage.setItem("Operations", JSON.stringify(toStoreOperations));
    lookup.localStorage.setItem("free_Operation_Index", JSON.stringify(free_Operation_Index));
};

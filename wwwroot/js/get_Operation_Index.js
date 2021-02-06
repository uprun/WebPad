lookup.free_Operation_Index = 0;

lookup.get_Operation_Index = function() {
    var toReturn = 
    {
        index: (lookup.free_Operation_Index++),
        is_local: true,
        prefix: "to-be-defined"
    }
    return toReturn;
};
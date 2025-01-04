lookup.populate_Operations = function(data) {

    var buffer = [];
    
    buffer = ko.utils.arrayMap(
        data.Operations, 
        function(elem)
        {
            return new lookup.model_Operation(elem);
        }
    );

    ko.utils.arrayPushAll(lookup.Operations, buffer);

    var distinctBuffer = {};

    ko.utils.arrayForEach
    (
        lookup.Operations(), 
        function(item) 
        {
            var key = item.toTupleKey();
            if(typeof(distinctBuffer[key]) !== 'undefined')
            {
                distinctBuffer[key].push(item);
            }
            else
            {
                distinctBuffer[key] = [item];
            }
        }
    );

    const distinctKeys = Object.keys(distinctBuffer);
    var toUseArray = [];

    distinctKeys.forEach((key, index) => {
        var localGroup = distinctBuffer[key];
        var sortedLocalGroup = localGroup.sort
        (
            (first, second) => first.time - second.time
        );
        toUseArray.push(sortedLocalGroup[0]);
    });

    var sortedDistinctObjects = toUseArray.sort((first, second) => first.time - second.time);

    lookup.Operations(sortedDistinctObjects);

};
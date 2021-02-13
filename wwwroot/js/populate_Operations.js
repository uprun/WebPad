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

};
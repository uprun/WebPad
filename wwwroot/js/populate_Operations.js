lookup.populate_Operations = function(data) {
    lookup.for_code_access_hash_of_color_presets = {};
    lookup.data_color_presets.forEach(element => {
        lookup.for_code_access_hash_of_color_presets[element.color] = true;
    });

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
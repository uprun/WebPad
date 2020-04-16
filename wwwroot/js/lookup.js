var lookup = {
    findNodeById: function(id){},
    defineLocalStorage: function(){},
    localStorage: undefined,
    actions: {},
    processMessageFromOuterSpace: function(item) {}
};
lookup.Notes = ko.observableArray([]);
lookup.ColorPresets = ko.observableArray([]);
lookup.Connections = ko.observableArray([]);
lookup.history = ko.observableArray([]); 
lookup.dictionary_of_notes = ko.pureComputed(function()
    {
        var dictionary = {};
        ko.utils.arrayForEach(lookup.Notes(), function(item) {
            var key = 
                item
                .text()
                .replace("\r", " ")
                .replace("\n", " ")
                .replace("\t", " ")
                .toLowerCase()
                .trim();
            dictionary[key] = item;
        });
        return dictionary;

    });
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

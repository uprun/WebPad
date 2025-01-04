lookup.data_color_presets = [ 
    { 
        color: "#ffa26b" 
    },
    { 
        color: "#84bfff" 
    },
    { 
        color: "#ff94eb" 
    },
    { 
        color: "#64e05e" 
    },
    { 
        color: "#f8e755" 
    },
    { 
        color: "#ffbbdc" 
    },
    { 
        color: "#d190ff" 
    },
    { 
        color: "#ff8f95" 
    }
];

lookup.ColorPresets = ko.observableArray([]);

lookup.populateColorPresets = function()
{
    var toAddColors = ko.utils.arrayMap(lookup.data_color_presets, function(elem) 
    {
        var toReturn = new lookup.model_ColorPreset(elem);
        return toReturn;
    });

    ko.utils.arrayPushAll(lookup.ColorPresets, toAddColors);

};

lookup.populateColorPresets();
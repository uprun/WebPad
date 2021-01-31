lookup.data_color_presets = [ 
    { 
        background: "inherit",
        color: "#ffa26b" 
    },
    { 
        background: "inherit",
        color: "#84bfff" 
    },
    { 
        background: "inherit",
        color: "#ff94eb" 
    },
    { 
        background: "inherit",
        color: "#64e05e" 
    },
    { 
        background: "inherit",
        color: "#f8e755" 
    },
    { 
        background: "inherit",
        color: "#ffbbdc" 
    },
    { 
        background: "inherit",
        color: "#d190ff" 
    },
    { 
        background: "inherit",
        color: "#ff8f95" 
    }
];;

lookup.populateColorPresets = function()
{
    var toAddColors = ko.utils.arrayMap(lookup.data_color_presets, function(elem) 
    {
        var toReturn = new lookup.model_ColorPreset(elem);
        return toReturn;
    });

    ko.utils.arrayPushAll(lookup.ColorPresets, toAddColors);

};


lookup.populate_Aliases = function(data)
    {
        var _aliases = JSON.parse(data.Aliases);
        // backend-worker context
        lookup.define_Aliases_if_needed();
        lookup.Aliases = _aliases;
        // var aliases_keys = Object.getOwnPropertyNames(data.Aliases);
        // for(var k = 0; k < aliases_keys.length; k++)
        // {
        //     var actual_key = aliases_keys[k];
        //     var connected_aliases = data.Aliases[actual_key];
        //     if( typeof(lookup.Aliases[actual_key]) === 'undefined')
        //     {
        //         lookup.Aliases[actual_key] = {};
        //     }
        //     // just in case if there are some aliases already
        //     Object.getOwnPropertyNames(connected_aliases).forEach(element => {
        //         lookup.Aliases[actual_key][element] = true;
        //     });
        // }
    };
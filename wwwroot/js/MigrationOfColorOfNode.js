lookup.MigrationOfColorOfNode = function(node)
{
    if(typeof(node.color) === "undefined" )
    {
        var selectedColor = lookup.GetRandomColor();
        lookup.ColorNodeFromCode(selectedColor, node);
    }
    else
    {
        var color_exists = lookup.for_code_access_hash_of_color_presets[node.color];
        if( typeof(color_exists) === "undefined")
        {
            var selectedColor = lookup.GetRandomColor();
            lookup.ColorNodeFromCode(selectedColor, node);
        }
    }
    

};
lookup.split_color_from_6_hex = function(color_in_6_hex)
{
    var hex_red = '0x' + color_in_6_hex.substring(1, 3);
    var hex_green = '0x' + color_in_6_hex.substring(3, 5);
    var hex_blue = '0x' + color_in_6_hex.substring(5, 7);
    var int_red = parseInt(hex_red, 16);
    var int_green = parseInt(hex_green, 16);
    var int_blue = parseInt(hex_blue, 16);
    var colorWithIntComponents = 
    {
        red: int_red,
        green: int_green,
        blue: int_blue
    };
    return colorWithIntComponents;
};

lookup.form_rgba_string_constant = function(color_with_components, alpha)
{
    var toReturn = 'rgba(' + color_with_components.red + ', ' + color_with_components.green + ', ' + color_with_components.blue + ', ' + alpha +')' ;
    return toReturn;
};
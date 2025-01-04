lookup.unique_strings = function(multiple_strings)
{
    var map = {};
    var result = multiple_strings.filter(elem => {
        if (elem in map)
        {
            return false;
        }
        else
        {
            map[elem] = true;
            return true;
        }
    });
    return result;
};
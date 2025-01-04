lookup.all_substrings_with_index_to_preserve = function(search, index_to_preserve)
{
    search = search.substr(0, 22);
    var result = [];
    for(var start_index = 0; start_index < search.length; start_index ++)
    {
        var mini_search = search.substr(start_index);
        for(var selected_length = mini_search.length; selected_length > 0; selected_length --)
        {
            if (start_index > index_to_preserve)
            {
                continue;
            }
            if (start_index + selected_length <= index_to_preserve)
            {
                continue;
            }
            result.push( mini_search.substr(0, selected_length) );
        }
    }
    result.sort((a,b) => a.length - b.length);
    result.reverse();
    return result;
};
lookup.does_it_match_search = function(item, single_search)
{
    if(item.name === 'create')
    {
        var searchResult =  item.data.text.toLowerCase().indexOf(single_search) >= 0;
        return searchResult;
    }
    else
    {
        if(item.name === 'quote' || item.name === 'quote-edit')
        {
            var searchResult1 = item.data.quoted.text.toLowerCase().indexOf(single_search) >= 0;
            var searchResult2 = item.data.current.text.toLowerCase().indexOf(single_search) >= 0;
            var searchResult =  searchResult1 || searchResult2;
            return searchResult;
        }
        else
        {
            return false;
        }
    }
};
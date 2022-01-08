lookup.add_Alias = function(left, right)
{
    // backend-worker context
    if( typeof(lookup.Aliases[left]) === 'undefined')
    {
        lookup.Aliases[left] = {};
    }
    lookup.Aliases[left][right] = true;
};

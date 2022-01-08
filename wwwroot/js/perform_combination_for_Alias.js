lookup.perform_combination_for_Alias = function(left, right)
{
    // backend-worker context
    lookup.add_Alias(left, right);
    lookup.add_Alias(right, left);
};
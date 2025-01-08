lookup.iterative_search_loop = function()
{
    lookup.iterative_search();
    lookup.iterative_search_loop_handler = setTimeout(lookup.iterative_search_loop, 30);
};

lookup.iterative_search_loop_handler = setTimeout(lookup.iterative_search_loop, 30);
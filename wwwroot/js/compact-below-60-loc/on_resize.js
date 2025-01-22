lookup.on_resize = function()
{
    var search_results = document.getElementById("webpad-search-results-absolute-position-2025-01-02");
    const width = search_results.getBoundingClientRect().width;
    var total_width = window.innerWidth;
    var spare_size = Math.round( (total_width - width) / 2.0 );
    search_results.style.left = spare_size + "px";
};
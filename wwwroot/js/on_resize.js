lookup.on_resize = function()
{
    var search_results = document.getElementById("webpad-search-results-absolute-position");
    const width = search_results.getBoundingClientRect().width;
    var total_width = window.innerWidth;
    var spare_size = Math.round( (total_width - width) / 2.0 );
    search_results.style.left = spare_size + "px";
    console.log("on_resize");
};
lookup.on_resize = function()
{
    var search_results = document.getElementById("webpad-search-results-absolute-position");
    const width = search_results.getBoundingClientRect().width;
    var total_width = window.innerWidth;
    var spare_size = Math.round( (total_width - width) / 2.0 );
    search_results.style.left = spare_size + "px";
    console.log("on_resize");

    
    let visible_note_info = {};
    lookup.set_visible_note_information(visible_note_info);
    if (lookup.option_show_help_demo_notes())
    {
        lookup.set_option_show_help_demo_notes_to_false();
    }
    else
    {
        lookup.set_option_show_help_demo_notes_to_true();
    }
    lookup.restore_first_to_render_note_information(visible_note_info);
    if (lookup.option_show_help_demo_notes())
    {
        lookup.set_option_show_help_demo_notes_to_false();
    }
    else
    {
        lookup.set_option_show_help_demo_notes_to_true();
    }
};
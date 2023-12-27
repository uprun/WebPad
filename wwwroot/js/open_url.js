lookup.open_url = function(data)
{
    console.log(data);
    const drag_threshold = 1.5 * lookup.body_anchorWidth();
    if ( lookup.body_total_movement_while_drag() > drag_threshold )
        return true;
    window.open(data.word, '_blank');
    return true;
}
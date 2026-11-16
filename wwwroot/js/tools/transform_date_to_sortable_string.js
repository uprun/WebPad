lookup.transform_date_to_sortable_string = function(date_input) {
    var date = lookup.get_sortable_day(date_input);

    var time = lookup.get_sortable_time(date_input);

    let result = date + "  " +  time;
    return result;
};
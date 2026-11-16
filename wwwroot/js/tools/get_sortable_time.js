lookup.get_sortable_time = function(date_input) {
    let result = (date_input.getHours() + "").padStart(2, "0") +
        ":" + (date_input.getMinutes() + "").padStart(2, "0") + 
        ":" + (date_input.getSeconds() + "").padStart(2, "0");
    return result;
};
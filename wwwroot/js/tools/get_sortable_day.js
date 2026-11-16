lookup.get_sortable_day = function(date_input) {
    let result = "" + date_input.getFullYear() +
        "-" + ((date_input.getMonth() + 1) + "").padStart(2, "0") +
        "-" + (date_input.getDate() + "").padStart(2, "0");
    return result;
};
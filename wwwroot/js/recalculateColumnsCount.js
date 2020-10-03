lookup.columnsCount = ko.observable(undefined);
lookup.recalculateColumnsCount = function() {

    lookup.columnsCount(1);
    return;
    // previous implementation
    var header_width = document.getElementById("webpad-header-absolute-position").offsetWidth;
    var found_columns = document.getElementsByClassName("webpad-text-column");
    if(found_columns.length > 0)
    {
        var column_width = found_columns[0].offsetWidth;
        var calculatedColumns = header_width / column_width;
        var rounded = Math.round(calculatedColumns, 0);
        var truncated = Math.trunc(rounded);
        lookup.columnsCount(truncated);
    }
};
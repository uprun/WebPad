lookup.columnsCount = ko.observable(undefined);
lookup.recalculateColumnsCount = function() {

    var header_width = document.getElementById("webpad-header-absolute-position").offsetWidth;
    var found_columns = document.getElementsByClassName("webpad-text-column");
    if(found_columns.length > 0)
    {
        var column_width = found_columns[0].offsetWidth;
        var calculatedColumns = header_width / column_width;
        // todo: add rounding here
        lookup.columnsCount(calculatedColumns);
    }
};
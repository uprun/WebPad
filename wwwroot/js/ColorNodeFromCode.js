lookup.ColorNodeFromCode = function(colorToApply, toWorkWith) {
                
    toWorkWith.color = colorToApply.Color();
    toWorkWith.background = colorToApply.Background();

    var info = toWorkWith.ConvertToJs();
    lookup.pushToHistory({
        action: lookup.actions.NoteUpdated,
        data: info
    });
};
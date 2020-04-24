lookup.CreateNote = function(obj, callback) {

    var selectedColor = lookup.GetRandomColor().Color();
    if(typeof(obj.textColor) !== "undefined")
    {
        selectedColor = obj.textColor;
    }
    var toAdd = lookup.Instanciate_model_node(
        {
            id: lookup.getLocalIndex(),
            text: obj.text,
            color: selectedColor,
            background: "inherit",
            createDate: new Date(),
            hasIncomingConnection: obj.hasIncomingConnection
        });
    var added = toAdd.ConvertToJs();
    lookup.pushToHistory({
        action: lookup.actions.NoteAdded,
        data: added
    });
    if(callback && typeof(callback) === "function") {
        callback(toAdd);
    }
};
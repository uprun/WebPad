lookup.RemoveNote = function(card) {
    var toRemove = card.Note;
    var deleted = toRemove.ConvertToJs();
    lookup.pushToHistory({
        action: lookup.actions.NoteDeleted,
        data: deleted
    });
};
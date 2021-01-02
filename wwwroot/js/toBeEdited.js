lookup.toBeEdited = ko.observable(undefined);
lookup.cardUnderEdit = ko.observable(undefined);
lookup.beginToEdit = function(card)
{
    lookup.cardUnderEdit(card);
    lookup.toBeEdited(card.Note.text());

};
lookup.cancelEdit = function()
{
    lookup.toBeEdited(undefined);
    lookup.cardUnderEdit(undefined);
};
lookup.applyChanges = function()
{
    lookup.cardUnderEdit().Note.text(lookup.toBeEdited());
    lookup.cancelEdit();
};
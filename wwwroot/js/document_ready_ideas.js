$(document).ready(function()
{
    var viewModel = new ConnectedNotesViewModel();
    viewModel.ApplyLookupToSelf();
    ko.applyBindings(viewModel);
    viewModel.getViewPortSize();
    window.addEventListener('resize', function(){  viewModel.getViewPortSize(); }, true);
    viewModel.loadNotes();
    viewModel.check_platform();
    console.log("anchor", document.getElementById("menu-icon-id").offsetHeight);
    const menu_icon = document.getElementById("menu-icon-id");
    console.log(menu_icon);
    lookup.body_anchorWidth( menu_icon.offsetHeight);
});
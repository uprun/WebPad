$(document).ready(function()
{
    var viewModel = new ConnectedNotesViewModel();
    viewModel.ApplyLookupToSelf();
    ko.applyBindings(viewModel);
    viewModel.getViewPortSize();
    window.addEventListener('resize', function(){  viewModel.getViewPortSize(); }, true);
    viewModel.loadNotes();
    viewModel.check_platform();
});
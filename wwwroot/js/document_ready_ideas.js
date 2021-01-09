$(document).ready(function()
{
    var viewModel = new ConnectedNotesViewModel();
    viewModel.ApplyLookupToSelf();
    ko.applyBindings(viewModel);
    viewModel.getViewPortSize();
    window.addEventListener('resize', function(){  viewModel.getViewPortSize(); }, true);
    window.addEventListener('scroll', function () {
        viewModel.getViewPortScrollPosition();
    }, true);
    viewModel.loadNotes();
    //setTimeout(viewModel.ActualGenerateConnections, 3000);
});
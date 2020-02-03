$(document).ready(function()
{
    var viewModel = new ConnectedNotesViewModel();
    viewModel.ApplyLookupToSelf();
    ko.applyBindings(viewModel);
    viewModel.recalculateColumnsCount();
    window.addEventListener('resize', function(){  viewModel.recalculateColumnsCount(); }, true);
    //setTimeout(viewModel.ActualGenerateConnections, 3000);
});
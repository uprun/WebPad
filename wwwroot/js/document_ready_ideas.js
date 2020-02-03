$(document).ready(function()
{
    var viewModel = new ConnectedNotesViewModel();
    viewModel.ApplyLookupToSelf();
    ko.applyBindings(viewModel);
    viewModel.recalculateColumnsCount();
    //setTimeout(viewModel.ActualGenerateConnections, 3000);
});
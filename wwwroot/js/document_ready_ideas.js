$(document).ready(function()
{
    var viewModel = new ConnectedNotesViewModel();
    ko.applyBindings(viewModel);
    //setTimeout(viewModel.ActualGenerateConnections, 3000);
});
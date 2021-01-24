lookup.SearchNotesQuery = ko.observable("");
lookup.SearchNotesQuery
    .extend({ rateLimit: 150 });
lookup
    .Operations
    .extend(
        { 
            rateLimit: 500 
        }
    )
    .subscribe(
        lookup.on_operations_changed,
        null, 
        "arrayChange"
    );
lookup.GetRandomColor = function() {
    var selectedColorIndex = Math.floor(Math.random() * lookup.ColorPresets().length);
    var selectedColor = lookup.ColorPresets()[selectedColorIndex];
    return selectedColor;
};
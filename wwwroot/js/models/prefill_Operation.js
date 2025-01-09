lookup.prefill_Operation = function(self, abc) {

    self.color = abc.color;
    self.text = abc.text;
    if(typeof(abc.color) === 'undefined')
    {
        self.color_border = "#ff12ff";
    }
    else
    {
        var color_with_components = lookup.split_color_from_6_hex(abc.color);

        self.color_border = lookup.form_rgba_string_constant(color_with_components, '0.6')
    }

    self.all_symbols = abc.text.split("");
};
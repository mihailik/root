module Mi.PE.Internal {
    export function formatEnum(value, type) {
        if (!value)
            return null;

        var textValue = null;

        if (type._map) {
            textValue = type._map[value];

            if (!type._map_fixed) {
                // fix for typescript bug
                for (var e in type) {
                    var num = type[e];
                    if (typeof num=="number")
                        type._map[num] = e;
                }
                type._map_fixed = true;

                textValue = type._map[value];
            }
        }
        
        if (textValue == null) {
            if (typeof value == "number")
                textValue = "#" + value.toString(16) + "h";
            else
                textValue = "enum:" + value;
        }

        return textValue;
    }
}
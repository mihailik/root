module Mi.PE.Internal {
    export function formatEnum(value, type) {
        if (!value)
            return null;
        
        var textValue;

        if (type._map)
            textValue = type._map[value];
        else if(typeof value=="number")
            textValue = type.name + ":" + value.toString(16)+"h";
        else
            textValue = type.name + ":" + value;

        return textValue;
    }
}
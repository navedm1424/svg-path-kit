export function assignReadonlyProperties<T>(
    o: T, properties: { [P in keyof T]?: T[P] }
) {
    const propertyDescriptorMap: PropertyDescriptorMap = {};
    for (const [property, value] of Object.entries(properties)) {
        propertyDescriptorMap[property] = {
            value, writable: false, configurable: false
        };
    }
    return Object.defineProperties(o, propertyDescriptorMap);
}

export function makePropertiesReadonly<T>(
    o: T, ...properties: (keyof T)[]
) {
    const propertyDescriptorMap: PropertyDescriptorMap = {};
    for (const property of properties) {
        propertyDescriptorMap[property] = {
            ...Object.getOwnPropertyDescriptor(o, property), writable: false, configurable: false
        };
    }
    return Object.defineProperties(o, propertyDescriptorMap);
}
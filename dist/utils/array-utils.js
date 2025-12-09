export function pick(array, ...indices) {
    return indices.map(i => array[i]);
}
;

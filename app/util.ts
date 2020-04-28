export function joinElements<T>(arr: T[], delimiter = ', ') {
    return arr.reduce((acc: (T | string)[], x) => acc.length === 0 ? [x] : [...acc, delimiter, x], []);
}
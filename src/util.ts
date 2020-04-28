export type RNG = () => number;

export function shuffle<T>(arr: T[], rng: RNG): T[] {
    arr = [...arr];
    for (let i = 0; i < arr.length - 1; i ++) {
        const j = Math.floor(rng() * (arr.length - i)) + i;
        if (i != j) {
            const t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;
        }
    }
    return arr;
}

export function randomHexString(size: number) {
    let str = Math.floor(Math.random() * Math.pow(16, size)).toString(16);
    while (str.length < size) {
        str = '0' + str;
    }
    return str;
}
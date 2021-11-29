interface Buffer extends Object {
    readReal48LE(index: number): number;
    readExtendedLE(index: number): number;
}
declare function ldexp(x: number, exp: number): number;

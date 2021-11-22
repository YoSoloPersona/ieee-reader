// declare namespace NodeJS {
// 	export interface Global {
// 	}
// }

interface Buffer extends Object {
    readReal48LE(index: number): number;
    readExtendedLE(index: number): number;
}

Buffer.prototype['readReal48LE'] = function (index: number): number {
    const real48 = this.slice(index, index + 6);
 
     if (real48[0] === 0)
         return 0.0;
 
     const exponent = real48[0] - 129.0;
     let mantissa = 0.0;
 
     for (let i = 1; i < 5; i++) {
         mantissa += real48[i];
         mantissa *= 0.00390625;
     }
 
     mantissa += (real48[5] & 0x7F);
     mantissa *= 0.0078125;
     mantissa += 1.0;
 
     if ((real48[5] & 0x80) === 0x80)
         mantissa = -mantissa;
 
     return mantissa * Math.pow(2, exponent);
 }

/*function UnsignedToFloat(u: number): number {
    return ((u - 2147483647 - 1) + 2147483648.0);
}*/

function ldexp(x: number, exp: number): number {
    return x * Math.pow(2, exp);
}

Buffer.prototype['readExtendedLE'] = function (index: number): number {
    const bytes = this.slice(index, index + 10).reverse();
    let f: number;
    let expon: number;

    expon = ((bytes[0] & 0x7F) << 8) | bytes[1];
    const hiMant: number = ((bytes[2] & 0x7F) === bytes[2]) ? 0 : 0x80000000 +
        (((bytes[2] & 0x7F) << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]);
    const loMant: number = ((bytes[6] & 0x7F) === bytes[6]) ? 0 : 0x80000000 +
        (((bytes[6] & 0x7F) << 24) | (bytes[7] << 16) | (bytes[8] << 8) | bytes[9]);

    if (expon == 0 && hiMant == 0 && loMant == 0) {
        f = 0;
    }
    else {
        if (expon == 0x7FFF)    /* Infinity or NaN */ {
            f = Number.NaN;
        }
        else {
            expon -= 16383;
            f = ldexp(hiMant, expon -= 31);
            f += ldexp(loMant, expon -= 32);
        }
    }

    if ((bytes[0] & 0x80) == 0x80) return -f;
    else return f;
}
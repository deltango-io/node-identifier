export interface IdentifierInstanceOptions {
    buffer?: Buffer;
    alphabet?: string;
    minLength?: number;
}
export const ProfanitySafeBase60 = '0123456789ABCDEFGHIJKLMNOPQRSTVWXYZabcdefghijklmnopqrstvwxyz';
export class Identifier {
    buffer: Buffer;
    alphabet: string;
    minLength: number;

    constructor(opts?: IdentifierInstanceOptions) {
        this.buffer = (opts ? opts.buffer : undefined) || Buffer.alloc(0);
        this.alphabet = (opts ? opts.alphabet : undefined) || ProfanitySafeBase60;
        this.minLength = (opts ? opts.minLength : undefined) || 0;
    }

    fromBuffer(buffer: Buffer): this {
        this.buffer = buffer;
        return this.trimBuffer();
    }

    trimBuffer(): this {
        if (this.buffer.length < 0 || this.buffer[0] !== 0x00)
            return this;

        for (let i: number = 0; i <= this.buffer.length; i++)
            if (this.buffer[i] !== 0x00)
                return this.fromBuffer(this.buffer.slice(i));

        this.buffer = Buffer.alloc(0);
        return this;
    }

    public toBuffer() {
        return this.buffer;
    }

    fromHex(hex: string): this {
        this.buffer = Buffer.from(hex, 'hex');
        return this.trimBuffer();
    }

    public toHex(minLength?: number) {
        const hex = this.buffer.toString('hex');
        return hex.padEnd(minLength || this.minLength, '0');
    }

    fromUniversallyUnique(uuid: string): this {
        return this.fromHex(uuid.replace(/-/g, ''));
    }

    toUniversallyUnique(): string {
        const hex = this.toHex().padEnd(32, '0');
        const sections: string[] = [];
        sections.push(hex.substr(0, 8));
        sections.push(hex.substr(8, 4));
        sections.push(hex.substr(12, 4));
        sections.push(hex.substr(16, 4));
        sections.push(hex.substr(20));
        return sections.join('-');
    }

    fromString(stringInput: string, alphabet?: string): this {
        return this.fromBuffer(require('base-x')(alphabet || this.alphabet).decode(stringInput));
    }

    public toString(minLength?: number, alphabet?: string): string;
    public toString(alphabet?: string, minLength?: number): string;
    public toString(arg1?: string | number, arg2?: string | number): string {
        const optMinimumLength: number =
            typeof arg1 === 'number' ? arg1 : typeof arg2 === 'number' ? arg2 : this.minLength;
        const optAlphabet: string = typeof arg1 === 'string' ? arg1 : typeof arg2 === 'string' ? arg2 : this.alphabet;
        return require('base-x')(optAlphabet).encode(this.buffer).padStart(optMinimumLength, optAlphabet[0]);
    }

    fromInt(numberInput: number): this {
        return this.fromHex(numberInput.toString(16));
    }

    public toInt() {
        return parseInt(this.toHex(), 16);
    }

    fromBigInt(bigInt: BigInt): this {
        return this.fromHex(bigInt.toString(16));
    }

    public toBigInt() {
        return BigInt('0x' + this.toHex());
    }

    generateObject(): this {
       return this.generateHexWithTimestamp(24);
    }

    generateBigInt(includeMilliseconds: boolean = false) {
        return this.generateHexWithTimestamp(16, false);
    }
    generateRandomBigInt() {
        return this.generateHex(16);
    }

    generateHexWithTimestamp(length: number, includeMilliseconds: boolean = false) {
        const time = this.getTimeAsHex(includeMilliseconds);
        const random = this.getRandomHex(length - time.length);
        return this.fromHex(time + random);
    }

    generateHex(length: number) {
        return this.fromHex(this.getRandomHex(length));
    }

    generateUniversallyUnique(version?: 1 | 4): this {
        switch (version) {
            case 1:
                return this.fromUniversallyUnique(require('uuid').v1());
            case 4:
            default:
                return this.fromUniversallyUnique(require('uuid').v4());
        }
    }

    generateRandomString(desiredLength: number) {
        let output: string = '';
        if (desiredLength > 0)
            output = this.getRandomAlphabetChar(false);

        for (let i = 0; i < (desiredLength - 2); i++)
            output += this.getRandomAlphabetChar();

        if (desiredLength > 1)
            output += this.getRandomAlphabetChar(false);

        return this.fromString(output);
    }

    getTimeAsHex(includeMilliseconds: boolean = true) {
        const time = new Date().getTime();
        const seconds = Math.floor(time / 1000).toString(16).padStart(8, '0');

        if (!includeMilliseconds)
            return seconds;

        const milliseconds = (time % 1000).toString(16).padStart(4, '0');
        return seconds + milliseconds;
    }

    getRandomHexChar(allowZero: boolean = true) {
        const random: number = Math.round(Math.random() * (allowZero ? 15 : 14));
        return (allowZero ? random : random + 1).toString(16);
    }

    getRandomHex(desiredLength: number) {
        let output: string = '';
        if (desiredLength > 0)
            output = this.getRandomHexChar(false);

        for (let i = 0; i < (desiredLength - 2); i++)
            output += this.getRandomHexChar();

        if (desiredLength > 1)
            output += this.getRandomHexChar(false);

        return output;
    }

    getRandomAlphabetChar(allowZero: boolean = false) {
        const multiplier = this.alphabet.length - (allowZero ? 1 : 2);
        const random: number = Math.round(Math.random() *  multiplier);
        return this.alphabet[allowZero ? random : random + 1];
    }
}

export function getIdentifier(opts?: IdentifierInstanceOptions): Identifier {
    return new Identifier(opts);
}

export function getIdentifierFromString(str: string): Identifier {
    return getIdentifier().fromString(str);
}

export function getIdentifierFromHex(hex: string): Identifier {
    return getIdentifier().fromHex(hex);
}
export function getIdentifierFromObject(hex: string): Identifier {
    return getIdentifierFromHex(hex);
}

export function getIdentifierFromUniversallyUnique(uuid: string): Identifier {
    return getIdentifier().fromUniversallyUnique(uuid);
}

export function generateObjectIdentifier(): Identifier {
    return getIdentifier().generateObject();
}
export function generateObjectIdentifierAsString(): string {
    return generateObjectIdentifier().toString()
}
export function generateObjectIdentifierAsHex(): string {
    return generateObjectIdentifier().toHex()
}

export function generateUniversallyUniqueIdentifier(version?: 1 | 4, opts?: IdentifierInstanceOptions): Identifier {
    return getIdentifier(opts).generateUniversallyUnique(version);
}

export function generateIdentifierWithBigInt(opts?: IdentifierInstanceOptions): Identifier {
    return getIdentifier(opts).generateBigInt();
}

export function getHexIdentifierAsString(id: string) {
    return getIdentifier().fromHex(id).toString();
}
export function getStringIdentifierAsHex(id: string) {
    return getIdentifier().fromString(id).toHex();
}

export function getUniversallyUniqueIdentifierAsString(id: string) {
    return getIdentifier().fromUniversallyUnique(id).toString();
}
export function getStringIdentifierAsUniversallyUnique(id: string) {
    return getIdentifier().fromString(id).toUniversallyUnique();
}

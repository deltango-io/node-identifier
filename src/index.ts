export * from "./lib";
import {IdentifierGenerationStrategy, IdentifierOptions, IdentifierStringMode, IdentifierValue} from "./lib";
import {IdentifierGenerator} from "./generator";
import {BaseConverter} from "base-x";

export class Identifier {

    static defaultGenerationStrategy: IdentifierGenerationStrategy = IdentifierGenerationStrategy.TimestampedUUID;

    static defaultOptions: IdentifierOptions = {
        alphabet: "ABCDEFGHIJKLMNOPQRSTUVWYXZabcdefghijklmnopqrstuvwxyz0123456789-_",
        stringMode: IdentifierStringMode.Base,
        minimumLength: 0
    }

    options: IdentifierOptions;

    constructor(value: IdentifierValue, options?: IdentifierOptions)
    constructor(options?: IdentifierOptions)
    constructor(value?: IdentifierValue | IdentifierOptions, options?: IdentifierOptions) {

        // set options
        if (typeof value === "object" && !Buffer.isBuffer(value)) {
            options = value;
            value = undefined;
        }
        this.options = {
            ...options,
            ...Identifier.defaultOptions
        }

        // use existing value
        if (value && typeof value === "string") {
            if (this.options.stringMode === IdentifierStringMode.UUID)
                this.uuid = value;
            if (this.options.stringMode === IdentifierStringMode.Base)
                this.base = value;
            if (this.options.stringMode === IdentifierStringMode.Hex)
                this.hex = value;
        }

        if (value && Buffer.isBuffer(value))
            this.buffer = value;

    }

    private _trimBuffer(buffer: Buffer) {
        // if empty buffer return
        if (buffer.length < 1)
            return buffer;

        // if first byte is non-zero return buffer
        if (buffer[0] !== 0x00)
            return buffer;

        // search for first non-zero byte
        for (let i: number = 0; i <= buffer.length; i++) {
            if (buffer[i] !== 0x00)
                return buffer.slice(i);
        }

        // return empty buffer
        return Buffer.alloc(0);
    }

    private _value: Buffer = Buffer.alloc(0);
    set buffer(buffer: Buffer) {
        this._value = this._trimBuffer(buffer);
    }
    get buffer() {
        return this._value;
    }

    private get _baseX(): BaseConverter {
        return require('base-x')(this.options.alphabet);
    }

    get base(): string {
        return this._baseX.encode(this.buffer).padStart(this.options.minimumLength, this.options.alphabet[0]);
    }
    set base(value: string) {
        this.buffer = this._baseX.decode(value);
    }

    get hex() {
        return this.buffer.toString('hex').padStart(this.options.minimumLength, '0');
    }
    set hex(hex: string) {
        this.buffer = Buffer.from(hex,'hex');
    }

    get uuid() {
        const hex = this.hex;
        const sections: string[] = [];
        sections.push(hex.substr(0, 8));
        sections.push(hex.substr(8, 4));
        sections.push(hex.substr(12, 4));
        sections.push(hex.substr(16, 4));
        sections.push(hex.substr(20));
        return sections.join('-');
    }
    set uuid(uuid: string) {
        this.hex = uuid.split('-').join('');
    }

    public toString(): string {
        if (this.options.stringMode === IdentifierStringMode.Base)
            return this.base;

        if (this.options.stringMode === IdentifierStringMode.Hex)
            return this.hex;

        if (this.options.stringMode === IdentifierStringMode.UUID)
            return this.uuid

        return '';
    }

    static generate(strategy?: IdentifierGenerationStrategy, options?: IdentifierOptions) {
        return IdentifierGenerator(strategy || this.defaultGenerationStrategy);
    }

    static generateTimestampedUUID(options?: IdentifierOptions) {
        return IdentifierGenerator(IdentifierGenerationStrategy.TimestampedUUID);
    }
    static generateRandomUUID(options?: IdentifierOptions) {
        return IdentifierGenerator(IdentifierGenerationStrategy.RandomUUID);
    }
    static generateObjectId(options?: IdentifierOptions) {
        return IdentifierGenerator(IdentifierGenerationStrategy.TimestampedUUID);
    }

    static fromBase(value: string, options?: IdentifierOptions) {
        const identifier = new Identifier(options);
        identifier.base = value
        return identifier;
    }
    static fromUUID(uuid: string, options?: IdentifierOptions) {
        const identifier = new Identifier(options);
        identifier.uuid = uuid;
        return identifier;
    }
    static fromHex(hex: string, options?: IdentifierOptions) {
        const identifier = new Identifier(options);
        identifier.hex = hex;
        return identifier;
    }

}


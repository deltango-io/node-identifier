export * from './lib';
import {
    Base64,
    IdentifierAllOptions,
    IdentifierGenerationStrategy,
    IdentifierOptions,
    IdentifierStringMode,
    IdentifierValue,
} from './lib';
import { IdentifierGenerator } from './generator';
import { BaseConverter } from 'base-x';
import * as crypto from 'crypto';

export class Identifier {
    static defaultGenerationStrategy: IdentifierGenerationStrategy = IdentifierGenerationStrategy.UUID;

    static defaultOptions: IdentifierAllOptions = {
        alphabet: Base64,
        stringMode: IdentifierStringMode.Base,
        minimumLength: 0,
        hashSalt: null,
        hashAlgorithm: 'sha1'
    };

    options: IdentifierAllOptions;

    constructor(value: IdentifierValue, options?: IdentifierOptions);
    constructor(options?: IdentifierOptions);
    constructor(value?: IdentifierValue | IdentifierOptions, options?: IdentifierOptions) {
        // set options
        if (typeof value === 'object' && !Buffer.isBuffer(value)) {
            options = value;
            value = undefined;
        }
        this.options = {
            ...Identifier.defaultOptions,
            ...options,
        };

        // use existing value
        if (value && typeof value === 'string') {
            if (this.options.stringMode === IdentifierStringMode.UUID) this.uuid = value;
            if (this.options.stringMode === IdentifierStringMode.Base) this.base = value;
            if (this.options.stringMode === IdentifierStringMode.Hex) this.hex = value;
        }

        if (value && Buffer.isBuffer(value)) this.buffer = value;
    }

    private _trimBuffer(buffer: Buffer) {
        // if empty buffer return
        if (buffer.length < 1) return buffer;

        // if first byte is non-zero return buffer
        if (buffer[0] !== 0x00) return buffer;

        // search for first non-zero byte
        for (let i: number = 0; i <= buffer.length; i++) {
            if (buffer[i] !== 0x00) return buffer.slice(i);
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
        this.buffer = Buffer.from(hex, 'hex');
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
        if (this.options.stringMode === IdentifierStringMode.Base) return this.base;

        if (this.options.stringMode === IdentifierStringMode.Hex) return this.hex;

        if (this.options.stringMode === IdentifierStringMode.UUID) return this.uuid;

        return '';
    }

    static generate(strategy?: IdentifierGenerationStrategy, options?: IdentifierOptions) {
        return IdentifierGenerator(strategy || this.defaultGenerationStrategy);
    }

    static fromBase(value: string, options?: IdentifierOptions) {
        const identifier = new Identifier(options);
        identifier.base = value;
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

    get hash() {
        let buffer: Buffer = this.buffer;
        if (this.options.hashSalt) {
            let salt: Buffer | string = this.options.hashSalt;
            if (typeof salt === "string") {
                salt = Buffer.from(salt, 'utf8');
            }
            buffer = Buffer.concat([
                this._value,
                salt
            ]);
        }

        const hash = crypto
            .createHash(this.options.hashAlgorithm)
            .update(buffer.toString())
            .digest();

        const result = this._baseX.encode(hash);
        return result;
    }
}

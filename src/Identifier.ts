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
                return this.fromBuffer(this.buffer.slice(i))


        this.buffer = Buffer.alloc(0);
        return this;
    }

  public toBuffer() {
    return this.buffer;
  }

  fromHex(hex: string): this {
    if (hex.length % 2) hex = '0' + hex;
    this.buffer = Buffer.from(hex, 'hex');
    return this.trimBuffer();
  }

  public toHex(minLength?: number) {
    return this.buffer.toString('hex').padStart(minLength || this.minLength, '0');
  }

  fromUUID(uuid: string): this {
    return this.fromHex(uuid.replace(/-/g, ''));
  }

  toUUID(): string {
    const hex = this.toHex().padStart(32, '0');
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
    const optMinimumLength: number = typeof arg1 === 'number' ? arg1 : typeof arg2 === 'number' ? arg2 : this.minLength;
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

  generateObjectId(): this {
    const time = new Date().getTime();
    let value: string = '';

    value += Math.floor(time / 1000)
      .toString(16)
      .padStart(8, '0');

    value += (time % 1000).toString(16).padStart(4, '0');

    while (value.length < 24) value += Math.round(Math.random() * 16).toString(16);

    return this.fromHex(value);
  }

  generateBigInt() {
    const time = new Date().getTime();
    let value: string = '';

    value += Math.floor(time / 1000)
      .toString(16)
      .padStart(8, '0');

    value += (time % 1000).toString(16).padStart(4, '0');

    while (value.length < 16) value += Math.round(Math.random() * 16).toString(16);

    return this.fromHex(value);
  }

  generateUUID(version?: 1 | 4): this {
    switch (version) {
      case 1:
        return this.fromUUID(require('uuid').v1());
      case 4:
      default:
        return this.fromUUID(require('uuid').v4());
    }
  }
}

export function getIdentifier(opts?: IdentifierInstanceOptions): Identifier {
  return new Identifier(opts);
}

export function getIdentifierFromString(str: string, opts?: IdentifierInstanceOptions): Identifier {
  return getIdentifier(opts).fromString(str);
}

export function getIdentifierFromHex(hex: string, opts?: IdentifierInstanceOptions): Identifier {
  return getIdentifier(opts).fromHex(hex);
}

export function getIdentifierFromUUID(uuid: string, opts?: IdentifierInstanceOptions): Identifier {
  return getIdentifier(opts).fromUUID(uuid);
}

export function generateIdentifierWithObjectId(opts?: IdentifierInstanceOptions): Identifier {
  return getIdentifier(opts).generateObjectId();
}

export function generateIdentifierWithUUID(version?: 1 | 4, opts?: IdentifierInstanceOptions): Identifier {
  return getIdentifier(opts).generateUUID(version);
}

export function generateIdentifierWithBigInt(opts?: IdentifierInstanceOptions): Identifier {
  return getIdentifier(opts).generateBigInt();
}

export function generateIdentifierWithRandomString(length: number, opts?: IdentifierInstanceOptions) {
  const identifier = getIdentifier(opts);
  let generated: string = '';
  while (generated.length < length) {
    const length = identifier.alphabet.length;
    const random = Math.random() * length;
    const index = Math.round(random);
    const value = identifier.alphabet[index] || '';
    //console.log(identifier.alphabet, length, random, index, value);
    generated += value;
  }

  //console.log('generated', generated);
  //return identifier;
  return identifier.fromString(generated);
}


export const Base16 = '0123456789abcdef';
export const Base32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const Base32z = 'ybndrfg8ejkmcpqxot1uwisza345h769';
export const Base36 = '0123456789abcdefghijklmnopqrstuvwxyz';
export const Base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export const Base62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const Base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export enum IdentifierGenerationStrategy {
    UUID = 'uuid',
    ObjectId = 'objectId',
    UUIDv1 = 'UUIDv1',
    UUIDv4 = 'UUIDv4',
}

export enum IdentifierStringMode {
    Base = 'base',
    Hex = 'hex',
    UUID = 'uuid',
}

export interface IdentifierOptions {
    alphabet: string;
    stringMode: IdentifierStringMode;
    minimumLength: number;
}

export type IdentifierValue = Buffer | string | number;

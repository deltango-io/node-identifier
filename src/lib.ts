export enum IdentifierGenerationStrategy {
    TimestampedUUID = 'uuid',
    RandomUUID = 'random',
    ObjectId = 'objectId',
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

import { IdentifierOptions, IdentifierGenerationStrategy } from './lib';
import { v1, v4 } from 'uuid';
import { Identifier } from './index';
import * as crypto from 'crypto';

export const IdentifierGenerator = (strategy: IdentifierGenerationStrategy, options?: IdentifierOptions) => {
    if (strategy === IdentifierGenerationStrategy.UUIDv4) {
        return Identifier.fromUUID(v4(), options);
    }

    if (strategy === IdentifierGenerationStrategy.UUIDv1) {
        return Identifier.fromUUID(v1(), options);
    }

    const time = new Date().getTime();
    const seconds = Math.floor(time / 1000)
        .toString(16)
        .padStart(8, '0');
    const milliseconds = (time % 1000).toString(16).padStart(4, '0');
    const timestamp = Buffer.from(seconds + milliseconds, 'hex');

    if (strategy === IdentifierGenerationStrategy.ObjectId) {
        const random = crypto.randomBytes(8);
        const buffer = Buffer.concat([timestamp, random]);
        return new Identifier(buffer, options);
    }

    if (strategy === IdentifierGenerationStrategy.UUID) {
        const process = crypto.randomBytes(3).toString('hex');
        const processHigh = process.substr(0, 3);
        const processLow = process.substr(3, 3);
        const version = 4;
        const seq = (8 + Math.round(Math.random() * 3)).toString(16);
        const random = crypto.randomBytes(6).toString('hex');
        return Identifier.fromHex(timestamp.toString('hex') + version + processHigh + seq + processLow + random);
    }
};

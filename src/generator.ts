import { IdentifierOptions, IdentifierGenerationStrategy } from './lib';
import { v1, v4 } from 'uuid';
import { Identifier } from './index';
import * as crypto from 'crypto';

export const IdentifierGenerator = (strategy: IdentifierGenerationStrategy, options?: IdentifierOptions) => {
    if (strategy === IdentifierGenerationStrategy.RandomUUID) return Identifier.fromUUID(v4(), options);

    if (strategy === IdentifierGenerationStrategy.TimestampedUUID) return Identifier.fromUUID(v1(), options);

    if (strategy === IdentifierGenerationStrategy.ObjectId) {
        const time = new Date().getTime();
        const seconds = Math.floor(time / 1000)
            .toString(16)
            .padStart(8, '0');
        const milliseconds = (time % 1000).toString(16).padStart(4, '0');
        const timestamp = Buffer.from(seconds + milliseconds, 'hex');
        const random = crypto.randomBytes(8);
        const buffer = Buffer.concat([timestamp, random]);
        return new Identifier(buffer, options);
    }
};

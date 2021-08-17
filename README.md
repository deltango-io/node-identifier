# node-identifier
A node.js helper for object/entity identifiers


## Basic Usage

### Generate a new identifier
```typescript
import {Identifier} from 'node-identifier';

// generate id
const identifier: Identifier = Identifier.generate();
const uuid = identifier.uuid; // 3b025e7c-e372-48f1-a0d8-489659702b64
const hex = identifier.hex; // 3b025e7ce37248f1a0d8489659702b64
const base = identifier.base; // 7Al5843JI8aDYSJZZcCtk
const buffer = identifier.buffer; // <Buffer 3b 02 5e 7c e3 72 48 f1 a0 d8 48 96 59 70 2b 64>
```

### Convert UUID to Base64 (default) and Back

```typescript
// convert UUID to Base64 (default)
import { Identifier } from './index';

const foo: Identifier = Identifier.fromUUID("3b025e7c-e372-48f1-a0d8-489659702b64");
const base64 = foo.base; // 7Al5843JI8aDYSJZZcCtk

// convert Base64 to UUID
const bar: Identifier = Identifier.fromBase("7Al5843JI8aDYSJZZcCtk");
const uuid = bar.uuid; // 3b025e7c-e372-48f1-a0d8-489659702b64

// convert UUID to Base64 (alternative syntax)
const xyz = new Identifier("7Al5843JI8aDYSJZZcCtk").uuid;
```

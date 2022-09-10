"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
class InstructionBase {
    constructor({ instruction, data, }, type = types_1.Type.Command) {
        this.type = types_1.Type.Command;
        this.instruction = instruction;
        this.data = data !== null && data !== void 0 ? data : 0;
        this.type = type;
    }
    get length() {
        return this.toArray().length;
    }
    toArray() {
        const arr = new Uint8Array(4);
        arr[0] = (this.data >> 16) & 0xff;
        arr[1] = (this.data >> 8) & 0xff;
        arr[2] = this.data & 0xff;
        arr[3] = this.instruction & 0xff;
        return arr;
    }
}
exports.default = InstructionBase;
//# sourceMappingURL=InstructionBase.js.map
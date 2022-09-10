"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const macroMap = {
    ADDB: {
        name: "ADDB",
        description: "Add Data to B",
        instructions: [
            {
                instruction: types_1.InstructionMap.SWP,
            },
            {
                instruction: types_1.InstructionMap.ADD,
                data: "${0}",
            },
            {
                instruction: types_1.InstructionMap.SWP,
            },
        ],
    },
};
exports.default = macroMap;
//# sourceMappingURL=macroMap.js.map
/* eslint-disable @typescript-eslint/naming-convention */
import { InstructionMap } from "./types";

const macroMap = {
  ADDB: {
    name: "ADDB",
    description: "Add Data to B",
    instructions: [
      {
        instruction: InstructionMap.SWP,
        data: "0",
      },
      {
        instruction: InstructionMap.ADDD,
        data: "${0}",
      },
      {
        instruction: InstructionMap.SWP,
        data: "0",
      },
    ],
  },
  ADDC: {
    name: "ADDC",
    description: "Add Data to C",
    instructions: [
      {
        instruction: InstructionMap.SWP,
        data: "1",
      },
      {
        instruction: InstructionMap.ADDD,
        data: "${0}",
      },
      {
        instruction: InstructionMap.SWP,
        data: "1",
      },
    ],
  },
};

export default macroMap;

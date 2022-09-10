import { InstructionMap } from "./types";

const macroMap = {
  ADDB: {
    name: "ADDB",
    description: "Add Data to B",
    instructions: [
      {
        instruction: InstructionMap.SWP,
      },
      {
        instruction: InstructionMap.ADD,
        data: "${0}",
      },
      {
        instruction: InstructionMap.SWP,
      },
    ],
  },
};

export default macroMap;

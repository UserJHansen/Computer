import {
  Logger,
  logger,
  LoggingDebugSession,
  InitializedEvent,
  TerminatedEvent,
  InvalidatedEvent,
  StackFrame,
  Scope,
  Handles,
  StoppedEvent,
  OutputEvent,
  Source,
} from "@vscode/debugadapter";
import { DebugProtocol } from "@vscode/debugprotocol";
import { Subject } from "await-notify";
import { promises } from "fs";
import * as net from "net";
import { file } from "tmp-promise";
import { build, createLineMap, getInstructions } from "./build";
import Instruction from "./Instruction";
import { InstructionMap } from "./types";

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  /** An absolute path to the "program" to debug. */
  program: string;
  /** Automatically stop target after launch. If not specified, target does not stop. */
  stopOnEntry?: boolean;
  /** enable logging the Debug Adapter Protocol */
  trace?: boolean;
  /** run without debugging */
  noDebug?: boolean;
}

export class CompDebugSession extends LoggingDebugSession {
  // we don't support multiple threads, so we can use a hardcoded ID for the default thread
  private static threadID = 1;

  // a Mock runtime (or debugger)
  private _source: string[] = [];
  private _currentFile: string = "";

  private _isConnected = false;
  private _isRunning = false;
  private _breakpoints: DebugProtocol.Breakpoint[] = [];
  private _rawBreakpoints: DebugProtocol.InstructionBreakpoint[] = [];
  private _lineMap: number[] = [];
  private _currentCTR = 0;

  private _variableHandles = new Handles<"locals" | "ram" | "memory">();
  private _stackFrames = new Map<number, StackFrame>();

  private _configurationDone = new Subject();

  private _valuesInHex = false;
  private _useInvalidatedEvent = false;

  /**
   * Creates a new debug adapter that is used for one debug session.
   * We configure the default implementation of a debug adapter here.
   */
  public constructor() {
    super("comp-debug.txt");

    // this debugger uses zero-based lines and columns
    this.setDebuggerLinesStartAt1(false);
    this.setDebuggerColumnsStartAt1(false);

    // this._runtime.on("output", (type, text, filePath, line, column) => {
    //   let category: string;
    //   switch (type) {
    //     case "prio":
    //       category = "important";
    //       break;
    //     case "out":
    //       category = "stdout";
    //       break;
    //     case "err":
    //       category = "stderr";
    //       break;
    //     default:
    //       category = "console";
    //       break;
    //   }
    //   const e: DebugProtocol.OutputEvent = new OutputEvent(
    //     `${text}\n`,
    //     category
    //   );

    //   if (text === "start" || text === "startCollapsed" || text === "end") {
    //     e.body.group = text;
    //     e.body.output = `group-${text}\n`;
    //   }

    //   e.body.source = this.createSource(filePath);
    //   e.body.line = this.convertDebuggerLineToClient(line);
    //   e.body.column = this.convertDebuggerColumnToClient(column);
    //   this.sendEvent(e);
    // });
    // this._runtime.on("end", () => {
    //   this.sendEvent(new TerminatedEvent());
    // });
  }

  /**
   * The 'initialize' request is the first request called by the frontend
   * to interrogate the features the debug adapter provides.
   */
  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    args: DebugProtocol.InitializeRequestArguments
  ): void {
    if (args.supportsInvalidatedEvent) {
      this._useInvalidatedEvent = true;
    }

    // build and return the capabilities of this debug adapter:
    response.body = response.body || {};

    // the adapter implements the configurationDone request.
    response.body.supportsConfigurationDoneRequest = true;

    // make VS Code use 'evaluate' when hovering over source
    response.body.supportsEvaluateForHovers = true;

    // make VS Code show a 'step back' button
    response.body.supportsStepBack = false;

    // make VS Code support data breakpoints
    response.body.supportsDataBreakpoints = false;

    // make VS Code support completion in REPL
    // response.body.supportsCompletionsRequest = true;
    // response.body.completionTriggerCharacters = [".", "["];

    // make VS Code send cancel request
    response.body.supportsCancelRequest = false;

    // make VS Code send the breakpointLocations request
    response.body.supportsBreakpointLocationsRequest = true;

    // make VS Code provide "Step in Target" functionality
    response.body.supportsStepInTargetsRequest = true;

    // the adapter defines two exceptions filters, one with support for conditions.
    // response.body.supportsExceptionFilterOptions = true;
    // response.body.exceptionBreakpointFilters = [
    //   {
    //     filter: "namedException",
    //     label: "Named Exception",
    //     description: `Break on named exceptions. Enter the exception's name as the Condition.`,
    //     default: false,
    //     supportsCondition: true,
    //     conditionDescription: `Enter the exception's name`,
    //   },
    //   {
    //     filter: "otherExceptions",
    //     label: "Other Exceptions",
    //     description: "This is a other exception",
    //     default: true,
    //     supportsCondition: false,
    //   },
    // ];
    response.body.supportsExceptionFilterOptions = false;

    // make VS Code send exceptionInfo request
    // response.body.supportsExceptionInfoRequest = true;
    response.body.supportsExceptionInfoRequest = false;

    // make VS Code send setVariable request
    // response.body.supportsSetVariable = true;
    response.body.supportsSetVariable = false;

    // make VS Code send setExpression request
    // response.body.supportsSetExpression = true;
    response.body.supportsSetExpression = false;

    // make VS Code send disassemble request
    response.body.supportsDisassembleRequest = true;
    response.body.supportsSteppingGranularity = true;
    response.body.supportsInstructionBreakpoints = true;

    // make VS Code able to read and write variable memory
    // response.body.supportsReadMemoryRequest = false;
    response.body.supportsReadMemoryRequest = true;
    response.body.supportsWriteMemoryRequest = false;

    // response.body.supportSuspendDebuggee = true;
    response.body.supportSuspendDebuggee = false;
    response.body.supportTerminateDebuggee = false;
    response.body.supportsFunctionBreakpoints = false;

    this.sendResponse(response);

    // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
    // we request them early by sending an 'initializeRequest' to the frontend.
    // The frontend will end the configuration sequence by calling 'configurationDone' request.
    this.sendEvent(new InitializedEvent());
  }

  /**
   * Called at the end of the configuration sequence.
   * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
   */
  protected configurationDoneRequest(
    response: DebugProtocol.ConfigurationDoneResponse,
    args: DebugProtocol.ConfigurationDoneArguments
  ): void {
    super.configurationDoneRequest(response, args);

    // notify the launchRequest that configuration has finished
    this._configurationDone.notify();
  }

  protected disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    args: DebugProtocol.DisconnectArguments,
    request?: DebugProtocol.Request
  ): void {
    this._isRunning = false;
    console.log(
      `disconnectRequest suspend: ${args.suspendDebuggee}, terminate: ${args.terminateDebuggee}`
    );
  }

  protected async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: ILaunchRequestArguments
  ) {
    // make sure to 'Stop' the buffered logging if 'trace' is not set
    logger.setup(
      args.trace ? Logger.LogLevel.Verbose : Logger.LogLevel.Stop,
      false
    );
    this._currentFile = args.program.trim();

    // wait 1 second until configuration has finished (and configurationDoneRequest has been called)
    await this._configurationDone.wait(1000);

    const data = await promises.readFile(args.program.trim());
    this._source = data.toString().split(/\r?\n/);
    this._lineMap = createLineMap(this._source);
    await this.debug(build(data.toString()));

    this.sendResponse(response);
    if (args.stopOnEntry) {
      this.sendEvent(new StoppedEvent("entry", CompDebugSession.threadID));
    } else {
      this.run();
    }
  }
  attachRequest = this.launchRequest;

  protected async debug(prog: Uint8Array) {
    await this.write("stop");
    const { path, cleanup } = await file();
    await promises.appendFile(path, prog);

    await this.write("debug:" + path);
    setTimeout(cleanup, 1000 * 60);
  }

  protected async write(
    value: string,
    timeout: number = 5000
  ): Promise<string> {
    if (this._isConnected) {
      return "";
    }
    this._isConnected = true;
    const connection = net.connect(41114, "localhost");
    connection.on("error", (err) => {
      console.error(`connection error: ${err}`);
      this.sendEvent(new OutputEvent(`connection error: ${err}`, "stderr"));
      this.sendEvent(new TerminatedEvent());
    });
    await new Promise((resolve) => connection.once("connect", resolve));

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        connection.removeListener("data", onData);
        reject(new Error("Timeout:" + value));
        connection.destroy();
        this._isConnected = false;
      }, timeout);
      const onData = (data: Buffer) => {
        clearTimeout(timeoutId);
        connection.removeListener("data", onData);
        const str = data.toString().slice(2);
        console.log("Read: " + str);

        if (!str.startsWith("ok")) {
          this.sendEvent(new OutputEvent(str, "stderr"));
          reject(new Error(str));
          return;
        }
        resolve(str);
        connection.destroy();
        this._isConnected = false;
      };
      connection.on("data", onData);

      const arr = new Uint8Array(Buffer.from("  " + value));
      for (let i = 0; i < 2; i++) {
        arr[i] = (value.length >> ((1 - i) * 8)) & 0xff;
      }
      console.log("Write:", value);
      connection.write(arr);
    });
  }

  protected async measure(): Promise<{
    [probe in
      | "A"
      | "B"
      | "C"
      | "D"
      | "CTR"
      | "Instruction"
      | "Data"
      | "CLK"]: number;
  }> {
    return await this.write("measure").then(async (data) => {
      data = data.replace("ok:", "");
      if (data.length === 0) {
        this.sendEvent(new OutputEvent("Reached Halt", "stderr"));
        console.log("No data, retrying");
        return this.write("run").then(console.log).then(this.measure);
      }

      try {
        return JSON.parse(data);
      } catch (e) {
        console.error(e);
        return {};
      }
    });
  }

  protected async step(stop: boolean = true): Promise<number> {
    const result = await this.write("step"),
      num = parseInt(result.replace("ok:", ""), 16);
    if (!result.startsWith("ok")) {
      throw new Error(result);
    } else if (!isNaN(num)) {
      if (this._currentCTR === num) {
        this._isRunning = false;
        this.sendEvent(
          new StoppedEvent("breakpoint", CompDebugSession.threadID)
        );
      }
      this._currentCTR = num;
      if (stop) {
        this.sendEvent(new StoppedEvent("step", CompDebugSession.threadID));
      }
      return num;
    }
    return this._currentCTR;
  }

  protected async run() {
    this._isRunning = true;
    this.sendEvent(new OutputEvent("run"));
    do {
      await this.step(false);
      // TODO: parse instruction
    } while (
      !this._breakpoints.find(
        (bp) => this._lineMap[bp.line || 0] === this._currentCTR
      ) &&
      !this._rawBreakpoints.find(
        (brk) => brk.instructionReference === this._currentCTR.toString()
      ) &&
      this._isRunning
    );
    this._isRunning = false;
    this.sendEvent(new StoppedEvent("breakpoint", CompDebugSession.threadID));
  }

  protected async disassembleRequest(
    response: DebugProtocol.DisassembleResponse,
    args: DebugProtocol.DisassembleArguments,
    request?: DebugProtocol.Request | undefined
  ) {
    const _instructions = getInstructions(this._source);
    const instructions = _instructions
      .flatMap<Instruction>((instruction) => {
        if (instruction instanceof Instruction) {
          return instruction;
        } else {
          return instruction.instructions;
        }
      })
      .map((instruction, index) => ({
        address: index.toString(),
        instructionBytes: Array.from(instruction.toArray())
          .map((n) => n.toString(16).padStart(2, "0"))
          .join(" "),
        instruction: instruction.instructionName + " " + instruction.data,
        line: this._lineMap.indexOf(index),
      }));

    response.body = {
      instructions,
    };
    this.sendResponse(response);
  }

  protected async setInstructionBreakpointsRequest(
    response: DebugProtocol.SetInstructionBreakpointsResponse,
    args: DebugProtocol.SetInstructionBreakpointsArguments,
    request?: DebugProtocol.Request | undefined
  ) {
    this._rawBreakpoints = args.breakpoints;

    this.sendResponse(response);
  }

  protected async setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): Promise<void> {
    const path = args.source.path as string,
      clientLines = args.breakpoints || [],
      sourceLines =
        this._source.length !== 0
          ? this._source
          : await promises
              .readFile(path)
              .then((data) => data.toString().split(/\r?\n/));

    if (path === this._currentFile) {
      this._breakpoints = clientLines.map((l) => ({
        verified:
          sourceLines
            .slice(l.line - 1)
            .filter((c) => c.trim().length > 0 && c.trim()[0] !== ";").length >
          0,
        line:
          sourceLines.indexOf(
            sourceLines
              .slice(l.line - 1)
              .filter((c) => c.trim().length > 0 && c.trim()[0] !== ";")[0]
          ) + 1,
      }));
    }

    // send back the actual breakpoint positions
    response.body = {
      breakpoints: this._breakpoints || [],
    };
    this.sendResponse(response);
  }

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    response.body = {
      threads: [{ id: CompDebugSession.threadID, name: "Main" }],
    };
    this.sendResponse(response);
  }

  protected stackTraceRequest(
    response: DebugProtocol.StackTraceResponse,
    args: DebugProtocol.StackTraceArguments
  ): void {
    const startFrame =
      typeof args.startFrame === "number" ? args.startFrame : 0;
    const maxLevels = typeof args.levels === "number" ? args.levels : 1000;
    const endFrame = startFrame + maxLevels;
    const frames: StackFrame[] = [
      new StackFrame(
        0,
        "CTR",
        new Source("CTR", this._currentFile),
        this._lineMap.indexOf(this._currentCTR)
      ),
    ];
    frames[0].instructionPointerReference = this._currentCTR.toString();

    // This would fill with a real stack based on the instructions in the source
    // TODO: read the passing instructions and fill the stack
    for (let i = startFrame; i < endFrame; i++) {
      const frame = this._stackFrames.get(i);
      if (frame) {
        frames.push(frame);
      } else {
        frames.push(new StackFrame(i, "???"));
      }
    }

    response.body = {
      stackFrames: frames,
      totalFrames: 1,
    };
    this.sendResponse(response);
  }

  protected scopesRequest(
    response: DebugProtocol.ScopesResponse,
    args: DebugProtocol.ScopesArguments
  ): void {
    response.body = {
      scopes: [
        new Scope("Registers", this._variableHandles.create("locals"), false),
        new Scope("Memory", this._variableHandles.create("memory"), false),
        new Scope("RAM", this._variableHandles.create("ram"), false),
      ],
    };
    this.sendResponse(response);
  }

  protected async readMemoryRequest(
    response: DebugProtocol.ReadMemoryResponse,
    { offset = 0, count, memoryReference }: DebugProtocol.ReadMemoryArguments
  ) {
    console.log("readMemoryRequest", offset, count, memoryReference);
    // const variable = this._variableHandles.get(Number(memoryReference));
    // if (typeof variable === "object" && variable.memory) {
    //   const memory = variable.memory.subarray(
    //     Math.min(offset, variable.memory.length),
    //     Math.min(offset + count, variable.memory.length)
    //   );

    //   response.body = {
    //     address: offset.toString(),
    //     data: base64.fromByteArray(memory),
    //     unreadableBytes: count - memory.length,
    //   };
    // } else {
    //   response.body = {
    //     address: offset.toString(),
    //     data: "",
    //     unreadableBytes: count,
    //   };
    // }

    this.sendResponse(response);
  }

  protected async variablesRequest(
    response: DebugProtocol.VariablesResponse,
    args: DebugProtocol.VariablesArguments,
    request?: DebugProtocol.Request
  ): Promise<void> {
    let vs: DebugProtocol.Variable[] = [];

    const vars = await this.measure();

    const v = this._variableHandles.get(args.variablesReference);
    if (v === "locals") {
      for (const varname in vars) {
        vs.push({
          name: varname,
          value: vars[varname].toString(),
          variablesReference: 0,
        });
      }
    } else if (v === "ram") {
      // TODO: Monitor instructions to find RAM content
    } else if (v === "memory") {
      this._source.forEach((line, i) => {
        if (/^SET (.+?) (.+?)(?: |$).*/.test(line)) {
          const [_, name, value] = line.match(
            /^SET (.+?) (.+?)(?: |$).*/
          ) as RegExpMatchArray;
          vs.push({
            name,
            value,
            variablesReference: 0,
          });
        }
      });
    }

    response.body = {
      variables: vs,
    };
    this.sendResponse(response);
  }

  protected continueRequest(
    response: DebugProtocol.ContinueResponse,
    args: DebugProtocol.ContinueArguments
  ): void {
    this.run();
    this.sendResponse(response);
  }

  protected pauseRequest(
    response: DebugProtocol.PauseResponse,
    args: DebugProtocol.PauseArguments,
    request?: DebugProtocol.Request | undefined
  ): void {
    this._isRunning = false;
    this.sendEvent(new StoppedEvent("pause", CompDebugSession.threadID));
    this.sendResponse(response);
  }

  protected nextRequest(
    response: DebugProtocol.NextResponse,
    args: DebugProtocol.NextArguments
  ): void {
    this.step();
    this.sendResponse(response);
  }

  protected stepInTargetsRequest(
    response: DebugProtocol.StepInTargetsResponse,
    args: DebugProtocol.StepInTargetsArguments
  ) {
    // TODO: implement
    // const targets = this._runtime.getStepInTargets(args.frameId);
    // response.body = {
    //   targets: targets.map((t) => {
    //     return { id: t.id, label: t.label };
    //   }),
    // };
    this.sendResponse(response);
  }

  protected stepInRequest(
    response: DebugProtocol.StepInResponse,
    args: DebugProtocol.StepInArguments
  ): void {
    this.step();
    this.sendResponse(response);
  }

  protected stepOutRequest(
    response: DebugProtocol.StepOutResponse,
    args: DebugProtocol.StepOutArguments
  ): void {
    // TODO: step out based on finding the return instruction
    this.step();
    this.sendResponse(response);
  }

  protected async evaluateRequest(
    response: DebugProtocol.EvaluateResponse,
    args: DebugProtocol.EvaluateArguments
  ): Promise<void> {
    let reply: string | number | boolean | undefined = undefined;

    if (args.expression.startsWith("$")) {
      // TODO: find the variable in the source
      reply = this.convertToRuntime(
        /^SET (.+?) (.+?)(?: |$).*/.exec(
          this._source.find((line) => line.includes(args.expression)) ||
            "SET 0 undefined"
        )?.[2] ?? "undefined"
      );
    } else if (args.expression.toUpperCase() in InstructionMap) {
      reply = InstructionMap[args.expression.toUpperCase()];
    } else {
      reply = (await this.measure())[args.expression];
    }

    const r =
      reply !== undefined
        ? typeof reply === "number"
          ? this.formatNumber(reply)
          : reply
        : "undefined";
    response.body = {
      result: r.toString(),
      type: typeof r,
      variablesReference: 0,
      presentationHint: {
        kind: "data",
        attributes: ["readOnly", "rawString"],
      },
    };

    this.sendResponse(response);
  }

  protected customRequest(
    command: string,
    response: DebugProtocol.Response,
    args: any
  ) {
    if (command === "toggleFormatting") {
      this._valuesInHex = !this._valuesInHex;
      if (this._useInvalidatedEvent) {
        this.sendEvent(new InvalidatedEvent(["variables"]));
      }
      this.sendResponse(response);
    } else {
      super.customRequest(command, response, args);
    }
  }

  //---- helpers

  private convertToRuntime(value: string): boolean | number | string {
    value = value.trim();

    if (value === "true") {
      return true;
    }
    if (value[0] === "'" || value[0] === '"') {
      return value.slice(1, value.length - 2);
    }
    const n = parseFloat(value);
    if (!isNaN(n)) {
      return n;
    }
    return value;
  }

  private formatNumber(x: number) {
    return this._valuesInHex ? "0x" + x.toString(16) : x.toString(10);
  }
}

const session = new CompDebugSession();
process.on("SIGTERM", () => {
  session.shutdown();
});
session.start(process.stdin, process.stdout);

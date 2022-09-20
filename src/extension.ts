/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/*
 * web-extension.ts (and activateMockDebug.ts) forms the "plugin" that plugs into VS Code and contains the code that
 * connects VS Code with the debug adapter.
 *
 * web-extension.ts launches the debug adapter "inlined" because that's the only supported mode for running the debug adapter in the browser.
 */

import * as vscode from "vscode";
import {
  WorkspaceFolder,
  DebugConfiguration,
  ProviderResult,
  CancellationToken,
} from "vscode";
import { CompDebugSession } from "./debugAdapter";
import { FileAccessor } from "./compRuntime";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.comp-debug.runEditorContents",
      (resource: vscode.Uri) => {
        let targetResource = resource;
        if (!targetResource && vscode.window.activeTextEditor) {
          targetResource = vscode.window.activeTextEditor.document.uri;
        }
        if (targetResource) {
          vscode.debug.startDebugging(
            undefined,
            {
              type: "comp",
              name: "Run File",
              request: "launch",
              program: targetResource.fsPath,
            },
            { noDebug: true }
          );
        }
      }
    ),
    vscode.commands.registerCommand(
      "extension.comp-debug.debugEditorContents",
      (resource: vscode.Uri) => {
        let targetResource = resource;
        if (!targetResource && vscode.window.activeTextEditor) {
          targetResource = vscode.window.activeTextEditor.document.uri;
        }
        if (targetResource) {
          vscode.debug.startDebugging(undefined, {
            type: "comp",
            name: "Debug File",
            request: "launch",
            program: targetResource.fsPath,
            stopOnEntry: true,
          });
        }
      }
    ),
    vscode.commands.registerCommand(
      "extension.comp-debug.toggleFormatting",
      (variable) => {
        const ds = vscode.debug.activeDebugSession;
        if (ds) {
          ds.customRequest("toggleFormatting");
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.comp-debug.getProgramName",
      (config) =>
        vscode.window
          .showOpenDialog({
            canSelectMany: false,
            filters: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              "Comp Assembly": ["asm"],
            },
            title:
              "Please enter the name of a compasm file in the workspace folder",
          })
          .then((file) => {
            if (file) {
              return file[0].fsPath;
            }
          })
    )
  );

  // register a configuration provider for 'comp' debug type
  const provider = new CompConfigurationProvider();
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider("comp", provider)
  );

  // register a dynamic configuration provider for 'comp' debug type
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider(
      "comp",
      {
        provideDebugConfigurations(
          folder: WorkspaceFolder | undefined
        ): ProviderResult<DebugConfiguration[]> {
          return [
            {
              name: "Dynamic Launch",
              request: "launch",
              type: "comp",
              program: "${file}",
            },
            {
              name: "Another Dynamic Launch",
              request: "launch",
              type: "comp",
              program: "${file}",
            },
            {
              name: "Mock Launch",
              request: "launch",
              type: "comp",
              program: "${file}",
            },
          ];
        },
      },
      vscode.DebugConfigurationProviderTriggerKind.Dynamic
    )
  );

  context.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory(
      "comp",
      new InlineDebugAdapterFactory()
    )
  );

  // override VS Code's default implementation of the debug hover
  // here we match only Mock "variables", that are words starting with an '$'
  context.subscriptions.push(
    vscode.languages.registerEvaluatableExpressionProvider("compasm", {
      provideEvaluatableExpression(
        document: vscode.TextDocument,
        position: vscode.Position
      ): vscode.ProviderResult<vscode.EvaluatableExpression> {
        const VARIABLE_REGEXP = /\$[a-z][a-z0-9]*/gi;
        const line = document.lineAt(position.line).text;

        let m: RegExpExecArray | null;
        while ((m = VARIABLE_REGEXP.exec(line))) {
          const varRange = new vscode.Range(
            position.line,
            m.index,
            position.line,
            m.index + m[0].length
          );

          if (varRange.contains(position)) {
            return new vscode.EvaluatableExpression(varRange);
          }
        }
        return undefined;
      },
    })
  );

  // override VS Code's default implementation of the "inline values" feature"
  context.subscriptions.push(
    vscode.languages.registerInlineValuesProvider("compasm", {
      provideInlineValues(
        document: vscode.TextDocument,
        viewport: vscode.Range,
        context: vscode.InlineValueContext
      ): vscode.ProviderResult<vscode.InlineValue[]> {
        const allValues: vscode.InlineValue[] = [];

        for (
          let l = viewport.start.line;
          l <= context.stoppedLocation.end.line;
          l++
        ) {
          const line = document.lineAt(l);
          var regExp = /\$([a-z][a-z0-9]*)/gi; // variables are words starting with '$'
          do {
            var m = regExp.exec(line.text);
            if (m) {
              const varName = m[1];
              const varRange = new vscode.Range(
                l,
                m.index,
                l,
                m.index + varName.length
              );

              // some literal text
              //allValues.push(new vscode.InlineValueText(varRange, `${varName}: ${viewport.start.line}`));

              // value found via variable lookup
              allValues.push(
                new vscode.InlineValueVariableLookup(varRange, varName, false)
              );

              // value determined via expression evaluation
              //allValues.push(new vscode.InlineValueEvaluatableExpression(varRange, varName));
            }
          } while (m);
        }

        return allValues;
      },
    })
  );
}

export function deactivate() {
  // nothing to do
}

class CompConfigurationProvider implements vscode.DebugConfigurationProvider {
  /**
   * Massage a debug configuration just before a debug session is being launched,
   * e.g. add all missing attributes to the debug configuration.
   */
  resolveDebugConfiguration(
    folder: WorkspaceFolder | undefined,
    config: DebugConfiguration,
    token?: CancellationToken
  ): ProviderResult<DebugConfiguration> {
    // if launch.json is missing or empty
    if (!config.type && !config.request && !config.name) {
      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === "compasm") {
        config.type = "comp";
        config.name = "Launch";
        config.request = "launch";
        config.program = "${file}";
        config.stopOnEntry = true;
      }
    }

    if (!config.program) {
      return vscode.window
        .showInformationMessage("Cannot find a program to debug")
        .then((_) => {
          return undefined; // abort launch
        });
    }

    return config;
  }
}

export const workspaceFileAccessor: FileAccessor = {
  isWindows: false,
  async readFile(path: string): Promise<Uint8Array> {
    let uri: vscode.Uri;
    try {
      uri = pathToUri(path);
    } catch (e) {
      return new TextEncoder().encode(`cannot read '${path}'`);
    }

    return await vscode.workspace.fs.readFile(uri);
  },
  async writeFile(path: string, contents: Uint8Array) {
    await vscode.workspace.fs.writeFile(pathToUri(path), contents);
  },
};

function pathToUri(path: string) {
  try {
    return vscode.Uri.file(path);
  } catch (e) {
    return vscode.Uri.parse(path);
  }
}

class InlineDebugAdapterFactory
  implements vscode.DebugAdapterDescriptorFactory
{
  createDebugAdapterDescriptor(
    _session: vscode.DebugSession
  ): ProviderResult<vscode.DebugAdapterDescriptor> {
    return new vscode.DebugAdapterInlineImplementation(
      new CompDebugSession(workspaceFileAccessor)
    );
  }
}

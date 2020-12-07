// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import MercuryCompletionProvider from "./completionProvider";

const MERCURY_MODE: vscode.DocumentSelector = {
  scheme: "file",
  language: "mercury",
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "vscode-mercury" is now active!'
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      MERCURY_MODE,
      new MercuryCompletionProvider(),
      ".",
      ":",
      "::"
    )
  );
}

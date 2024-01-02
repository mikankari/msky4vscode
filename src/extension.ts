import * as vscode from 'vscode';
import { ViewProvider } from './ViewProvider.js';

export function activate(context: vscode.ExtensionContext) {
	const viewProvider = new ViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ViewProvider.viewId,
			viewProvider,
		)
	);
}

export function deactivate() {}

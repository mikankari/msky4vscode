import * as vscode from 'vscode';
import * as ejs from 'ejs';

export class ViewProvider implements vscode.WebviewViewProvider {
	private _callbacks: {[eventType: string]: (message?) => void} = {};
	private _webviewView?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) {
	}

	on(eventType: string, callback: (message?) => void): void {
		this._callbacks[eventType] = callback;
	}

	resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
		this._webviewView = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri,
			],
		};

		webviewView.webview.onDidReceiveMessage((message) => {
			this._callbacks[message.form](message.inputs);
		});

		webviewView.webview.html = 'Loading...';
		return ejs.renderFile(
			this._extensionUri.fsPath + '/view/view.html.ejs',
			{
				viewJsUri: webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out/view.js')),
			},
		)
		.then((rendered) => {
			webviewView.webview.html = rendered;
		});
	}

	emit(eventType: string, message?): void {
		this._webviewView?.webview.postMessage({
			eventType,
			message,
		});
	}
}

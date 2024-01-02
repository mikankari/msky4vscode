import * as vscode from 'vscode';
import * as ejs from 'ejs';

export class ViewProvider implements vscode.WebviewViewProvider {
	private _webviewView?: vscode.WebviewView;

	public static readonly viewId = 'msky4vscode.view';

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) {
	}

	resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
		this._webviewView = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri,
			],
		};

		webviewView.webview.html = 'Loading...';
		return ejs.renderFile(
			this._extensionUri.fsPath + '/view/view.html.ejs',
			{
				viewJsUri: webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out/view.js')),
			},
		)
		.then((str) => {
			webviewView.webview.html = str;
		});
	}
}

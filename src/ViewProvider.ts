import * as vscode from 'vscode';
import * as ejs from 'ejs';
import { Note } from 'misskey-js/built/entities';

export type ListeningEvents = {
	'load': {
		inputs: {};
	};
	'login': {
		inputs: {
			server: string;
			accessToken: string;
		};
	};
	'logout': {
		inputs: {};
	};
	'note': {
		inputs: {
			content: string;
		};
	};
};

export type EmittingEvents = {
	'loggedin': {
		message: {
			avatarUrl: string;
			host: string;
		};
	};
	'loggedin-error': {
		message: any;
	};
	'loggedout': {
		message: undefined;
	};
	'noted': {
		message: undefined;
	};
	'noted-error': {
		message: any;
	};
	'note': {
		message: Note;
	};
	'error': {
		message: any;
	};
};

export class ViewProvider implements vscode.WebviewViewProvider {
	private _callbacks: {[Type in keyof ListeningEvents]?: (message: ListeningEvents[Type]['inputs']) => void} = {};
	private _visibilityChangedCallback?: (visibliity: boolean) => void;
	private _webviewView?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) {
	}

	on<Type extends keyof ListeningEvents>(eventType: Type, callback: (message: ListeningEvents[Type]['inputs']) => void): void {
		this._callbacks[eventType] = callback;
	}

	onVisibilityChanged(callback: (visibliity: boolean) => void): void {
		this._visibilityChangedCallback = callback;
	}

	resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
		this._webviewView = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri,
			],
		};

		webviewView.onDidChangeVisibility(() => {
			this._visibilityChangedCallback?.(webviewView.visible);
		});
		webviewView.onDidDispose(() => {
			this._visibilityChangedCallback?.(false);
		});

		webviewView.webview.onDidReceiveMessage(<Type extends keyof ListeningEvents>(message: { form: Type, inputs: ListeningEvents[Type]['inputs']}) => {
			this._callbacks[message.form]?.(message.inputs);
		});

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

	emit<Type extends keyof EmittingEvents>(eventType: Type, message?: EmittingEvents[Type]['message']): void {
		this._webviewView?.webview.postMessage({
			eventType,
			message,
		});
	}
}

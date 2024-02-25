import * as vscode from 'vscode';
import { ListeningEvents, ViewProvider } from './ViewProvider.js';
import * as Misskey from 'misskey-js';
import WebSocket from "ws";
import fetch from 'node-fetch';

let client: Misskey.api.APIClient | undefined;
let stream: Misskey.Stream | undefined;
let channel: Misskey.ChannelConnection | undefined;

export function activate(context: vscode.ExtensionContext): void {
	const viewProvider = new ViewProvider(context.extensionUri);

	viewProvider.on('load', async () => {
		const server = context.globalState.get('server');
		const accessToken = context.globalState.get('accessToken');
		if (typeof server === 'string' && typeof accessToken === 'string') {
			try {
				await connectStream({ server, accessToken }, viewProvider);
			} catch (error) {
				viewProvider.emit('loggedin', { avatarUrl: '' , host: server });
				viewProvider.emit('error', error);
			}
		} else {
			disconnectStream(viewProvider);
		}
	});
	viewProvider.onVisibilityChanged((visibliity) => {
		if (! visibliity) {
			disconnectStream(viewProvider);
		}
	});
	viewProvider.on('login', async (inputs) => {
		try {
			await connectStream(inputs, viewProvider);
		} catch (error) {
			viewProvider.emit('loggedin-error', error);
			return;
		}
		context.globalState.update('server', inputs.server);
		context.globalState.update('accessToken', inputs.accessToken);
	});
	viewProvider.on('logout', () => {
		disconnectStream(viewProvider);
		context.globalState.update('server', undefined);
		context.globalState.update('accessToken', undefined);
	});
	viewProvider.on('note', async (inputs) => {
		try {
			if (client === undefined) {
				return;
			}
			await client.request('notes/create', {
				text: inputs.content,
			});
			viewProvider.emit('noted');
		} catch (error) {
			viewProvider.emit('noted-error', error);
		}
	});

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'msky4vscode.view',
			viewProvider,
		)
	);
}

async function connectStream(inputs: ListeningEvents['login']['inputs'], viewProvider: ViewProvider): Promise<void> {
	client = new Misskey.api.APIClient({
		origin: `https://${inputs.server}`,
		credential: inputs.accessToken,
		fetch,
	});
	viewProvider.emit('loggedin', {
		avatarUrl: (await client.request('i')).avatarUrl,
		host: inputs.server,
	});

	channel?.dispose();
	stream?.close();
	try {
		(await client.request('notes/timeline', { limit: 100 }))
			.reverse()
			.forEach((note) => viewProvider.emit('note', note));
	} catch (error) {
		viewProvider.emit('error', error);
	}
	stream = new Misskey.Stream(
		`https://${inputs.server}`,
		{ token: inputs.accessToken },
		{ WebSocket }
	);
	channel = stream.useChannel('homeTimeline');
	channel.on('note', (note) => viewProvider.emit('note', note));
};

export function deactivate(): void {
	disconnectStream();
}

function disconnectStream(viewProvider?: ViewProvider): void {
	channel?.dispose();
	channel = undefined;
	stream?.close();
	stream = undefined;
	client = undefined;
	viewProvider?.emit('loggedout');
}

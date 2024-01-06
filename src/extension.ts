import * as vscode from 'vscode';
import { ViewProvider } from './ViewProvider.js';
import * as Misskey from 'misskey-js';
import WebSocket from "ws";
import fetch from 'node-fetch';

let client: Misskey.api.APIClient | undefined;
let stream: Misskey.Stream | undefined;
let channel: Misskey.ChannelConnection | undefined;

export function activate(context: vscode.ExtensionContext) {
	const viewProvider = new ViewProvider(context.extensionUri);

	viewProvider.on('login', (inputs) => {
		context.globalState.update('server', inputs.server);
		context.globalState.update('accessToken', inputs.accessToken);
		connectStream(inputs, viewProvider);
	});
	viewProvider.on('logout', () => {
		context.globalState.update('server', undefined);
		context.globalState.update('accessToken', undefined);
		disconnectStream(viewProvider);
	});
	viewProvider.on('note', (inputs) => {
		return client?.request('notes/create', {
			text: inputs.content,
		});
	});

	const server = context.globalState.get('server');
	const accessToken = context.globalState.get('accessToken');
	if (server !== undefined && accessToken !== undefined) {
		connectStream({ server, accessToken }, viewProvider);
	} else {
		disconnectStream(viewProvider);
	}

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			'msky4vscode.view',
			viewProvider,
		)
	);
}

async function connectStream(inputs, viewProvider: ViewProvider) {
	client = new Misskey.api.APIClient({ origin: `https://${inputs.server}`, credential: inputs.accessToken, fetch });
	viewProvider.emit('loggedin', await client.request('i'));
	(await client.request('notes/timeline'))
		.reverse()
		.forEach((note) => viewProvider.emit('note', note));
	stream = new Misskey.Stream(`https://${inputs.server}`, { token: inputs.accessToken }, { WebSocket });
	stream.on('_connected_', () => viewProvider.emit('connected'));
	stream.on('_disconnected_', () => viewProvider.emit('disconnected'));
	channel = stream.useChannel('homeTimeline');
	channel.on('note', (note) => viewProvider.emit('note', note));
};

export function deactivate() {
	disconnectStream();
}

function disconnectStream(viewProvider?: ViewProvider) {
	if (channel !== undefined) {
		channel.dispose();
		channel = undefined;
	}
	if (stream !== undefined) {
		stream.close();
		stream = undefined;
	}
	client = undefined;
	viewProvider?.emit('loggedout');
}

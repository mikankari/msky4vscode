import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea, vsCodeTextField } from "@vscode/webview-ui-toolkit";
import { VSCodeButton, VSCodeTextArea, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import React from "react";
import { useState } from "react";
import { createRoot } from 'react-dom/client';
import { useTimeline } from "./useTimeline";
import { useLoggedInAccount } from "./useLoggedInAccount";

provideVSCodeDesignSystem().register(vsCodeTextArea(), vsCodeTextField(), vsCodeButton());

const vscode = acquireVsCodeApi();

function App() {
    const [server, setServer] = useState('misskey.io');
    const [accessToken, setAccessToken] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const loggedInAccount = useLoggedInAccount();
    const timeline = useTimeline();

    const onLogin = function () {
        vscode.postMessage({
            form: 'login',
            inputs: {
                server,
                accessToken,
            },
        });
    };

    const onLogout = function () {
        vscode.postMessage({
            form: 'logout',
            inputs: {},
        });
    };

    const onNote = function () {
        vscode.postMessage({
            form: 'note',
            inputs: {
                content: noteContent,
            },
        });
        setNoteContent('');
    };

    if (loggedInAccount === undefined) {
        return (
            <form action="#">
                <div>
                    <VSCodeTextField
                        name="server"
                        value={server}
                        onInput={(event) => setServer(event.target.value)}
                    >
                        Server
                    </VSCodeTextField>
                    <VSCodeTextField
                        name="access_token"
                        value={accessToken}
                        onInput={(event) => setAccessToken(event.target.value)}
                    >
                        Access token
                    </VSCodeTextField>
                </div>
                <div>
                    <VSCodeButton onClick={onLogin}>Log in</VSCodeButton>
                </div>
            </form>
        );
    }

    return (
        <>
            <form action="#">
                <div className="clearfix">
                    <div className="left">
                        <img src={loggedInAccount.avatarUrl} alt="My account avatar" />
                    </div>
                    <div className="right">
                        <VSCodeButton onClick={onLogout} appearance="secondary">Log out</VSCodeButton>
                    </div>
                </div>
            </form>
            <form action="#">
                <div>
                    <VSCodeTextArea
                        name="content"
                        value={noteContent}
                        onInput={(event) => setNoteContent(event.target.value)}
                        placeholder="What's happening around you?"
                    ></VSCodeTextArea>
                </div>
                <div>
                    <VSCodeButton onClick={onNote}>Note</VSCodeButton>
                </div>
            </form>
            <ul>
                {timeline.map((note) => {
                    return (
                <li key={note.id}>
                    <div className="clearfix note">
                        <div className="left">
                            <img src={note.user.avatarUrl} alt="User account avator" />
                        </div>
                        <div className="right">
                            <div className="clearfix">
                                <div className="left">{note.user.name}</div>
                                <div className="right">{note.createdAt}</div>
                            </div>
                            <div>{note.text}</div>
                        </div>
                    </div>
                </li>
                    );
                })}
            </ul>
        </>
    );
}

createRoot(document.querySelector('#app') as HTMLDivElement).render(<App />);

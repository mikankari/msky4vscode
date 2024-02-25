import { VSCodeButton, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import React from "react";
import { useState } from "react";
import * as styles from './view.style';
import { EmittingEvents } from '../src/ViewProvider';

export function ViewBeforeLogin({ onLogin, loggedInError }: {
    onLogin: (server: string, accessToken: string) => void;
    loggedInError: EmittingEvents['loggedin-error']['message'] | undefined;
}) {
    const [server, setServer] = useState('');
    const [accessToken, setAccessToken] = useState('');

    return (
        <div className={styles.app}>
            <form action="#">
                <div className={styles.formItem}>
                    <div>
                        <VSCodeTextField
                            name="server"
                            value={server}
                            onInput={(event) => setServer(event.target.value)}
                            className={styles.formInput}
                        >
                            Server
                        </VSCodeTextField>
                    </div>
                    <div>
                        {[
                            'misskey.io',
                            'misskey.design',
                            'nijimiss.moe',
                        ].map((suggestion) =>
                            <VSCodeButton
                                key={suggestion}
                                appearance="secondary"
                                onClick={() => setServer(suggestion)}
                            >
                                {suggestion}
                            </VSCodeButton>
                        )}
                    </div>
                    <p className={[styles.reset, styles.formDescription].join(' ')}>
                        Domain name of the server hosting your account. <a href="https://misskey-hub.net/servers/" className={styles.link}>Server List</a>
                    </p>
                </div>
                <div className={styles.formItem}>
                    <div>
                        <VSCodeTextField
                            name="access_token"
                            type="password"
                            value={accessToken}
                            onInput={(event) => setAccessToken(event.target.value)}
                            className={styles.formInput}
                        >
                            Access token
                        </VSCodeTextField>
                    </div>
                    <p className={[styles.reset, styles.formDescription].join(' ')}>
                        Access token generated from <a href={`https://${server}/settings/api`} className={styles.link}>Settings -&gt; API</a>.<br />
                        Enter the following in the "Generate access token" modal.
                    </p>
                    <div className={styles.formDescription}>
                        <dl>
                            <dt>Name</dt>
                            <dd>Misskey for VSCode</dd>
                            <dt>Permissions</dt>
                            <dd>
                                <ul className={styles.reset}>
                                    <li>View your account information</li>
                                    <li>Compose or delete notes</li>
                                </ul>
                            </dd>
                        </dl>
                    </div>
                </div>
                {loggedInError !== undefined &&
                    <p className={styles.error}>{JSON.stringify(loggedInError)}</p>
                }
                <div>
                    <VSCodeButton onClick={() => onLogin(server, accessToken)}>Log in</VSCodeButton>
                </div>
            </form>
        </div>
    );
}

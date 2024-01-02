import { provideVSCodeDesignSystem, vsCodeButton, vsCodeTextArea } from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeTextArea(), vsCodeButton());

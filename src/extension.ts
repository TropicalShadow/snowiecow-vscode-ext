import * as vscode from "vscode";

export function activate({
    subscriptions,
    extensionUri,
}: vscode.ExtensionContext) {
    subscriptions.push(
        vscode.commands.registerCommand("snowiecow-buddy.snowiecow", () => {
            const snowieWebPanel = vscode.window.createWebviewPanel(
                "snowieCow",
                "Snowie Cow",
                vscode.ViewColumn.Two,
                { enableScripts: true }
            );

            const snowiecowRightUri = getUriMediaPath(
                snowieWebPanel,
                extensionUri,
                "right_btn.webp"
            );
            const snowiecowLeftUri = getUriMediaPath(
                snowieWebPanel,
                extensionUri,
                "left_btn.webp"
            );
            const snowiecowMiddleUri = getUriMediaPath(
                snowieWebPanel,
                extensionUri,
                "middle_btn.webp"
            );

            const snowiecowFrameGenerator = getButtonState();
            snowieWebPanel.webview.html = getWebviewContent(
                snowiecowLeftUri,
                snowiecowRightUri,
                snowiecowMiddleUri
            );

            let typeCommand = vscode.commands.registerCommand(
                "type", (...args) => {
                    snowieWebPanel.webview.postMessage(
                        snowiecowFrameGenerator.next().value
                    );
                    return vscode.commands.executeCommand(
                        "default:type",
                        ...args
                    );
                }
            );
            subscriptions.push(typeCommand);

            snowieWebPanel.onDidDispose(
                () => {
                    typeCommand.dispose();
                },
                null,
                subscriptions
            );
        })
    );
}

function getUriMediaPath(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    mediaPath: string
) {
    const path = vscode.Uri.joinPath(extensionUri, "media", mediaPath);
    return panel.webview.asWebviewUri(path);
}

function getWebviewContent(
    snowieCowLeftUri: vscode.Uri,
    snowieCowRightUri: vscode.Uri,
    snowieCowMiddleUri: vscode.Uri
) {
    return `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Snowie Cow</title>
		</head>
		<body>
			<img id="btn-middle" src=${snowieCowMiddleUri} width="100%"/>
			<img id="btn-left" src=${snowieCowLeftUri} width="100%" hidden/>
			<img id="btn-right" src=${snowieCowRightUri} width="100%" hidden/>
		</body>
		<script>
			const snowieCowLeft = document.getElementById('btn-left');
			const snowieCowRight= document.getElementById('btn-right');
			const snowieCowMiddle= document.getElementById('btn-middle');
			let timeout;

			window.addEventListener('message', event => {
				const message = event.data;
				clearTimeout(timeout);
				if(message == 'left'){
					snowieCowMiddle.hidden = true;
					snowieCowLeft.hidden = false;
					snowieCowRight.hidden = true;
				}else{
					snowieCowMiddle.hidden = true;
					snowieCowLeft.hidden = true;
					snowieCowRight.hidden = false;
				}
				timeout = setTimeout(() => {snowieCowLeft.hidden = true; snowieCowRight.hidden = true; snowieCowMiddle.hidden = false; }, 200);
			});
		</script>
	</html>`;
}

enum ButtonState {
    LEFT = "left",
    RIGHT = "right",
}

function* getButtonState() {
    let current = ButtonState.LEFT;
    while (true) {
        if (current === ButtonState.LEFT) {
            current = ButtonState.RIGHT;
            yield ButtonState.RIGHT;
        } else {
            current = ButtonState.LEFT;
            yield ButtonState.LEFT;
        }
    }
}

export function deactivate() {}

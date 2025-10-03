import { App, Modal, Setting } from "obsidian";

export class ExecuteShellModal extends Modal {
    vaultName: string;
    command: string;
    onSubmit: (vaultName: string, command: string) => void;

    constructor(app: App, onSubmit: (vaultName: string, command: string) => void) {
        super(app);
        this.vaultName = ""; // Initialize vaultName
        this.command = "";     // Initialize command
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Execute Shell Command in Agent Vault" });

        new Setting(contentEl)
            .setName("Agent Vault Name")
            .addText((text) => {
                text.setPlaceholder("e.g., agent-coding-vault-1");
                text.onChange((value) => {
                    this.vaultName = value;
                });
            });

        new Setting(contentEl)
            .setName("Command")
            .addText((text) => {
                text.setPlaceholder("e.g., pnpm install");
                text.onChange((value) => {
                    this.command = value;
                });
                text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.close();
                        this.onSubmit(this.vaultName, this.command);
                    }
                });
            });

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Execute")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(this.vaultName, this.command);
                    }));
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

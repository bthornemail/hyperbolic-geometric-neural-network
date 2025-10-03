import { App, Modal, Setting } from "obsidian";

export class CreateVaultModal extends Modal {
    result: string;
    onSubmit: (result: string) => void;

    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.result = ""; // Initialize result
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Create New Agent Vault" });

        new Setting(contentEl)
            .setName("Vault Name")
            .addText((text) => {
                text.onChange((value) => {
                    this.result = value;
                });
                text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.close();
                        this.onSubmit(this.result);
                    }
                });
            });

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Create")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(this.result);
                    }));
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}

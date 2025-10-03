import { App, Modal, Setting, Notice } from "obsidian";

export class AgentIdentityModal extends Modal {
    agentId: string;
    agentIdentityContent: string;
    onSubmit: (agentId: string, agentIdentityContent: string) => void;

    constructor(app: App, agentId: string, agentIdentityContent: string, onSubmit: (agentId: string, agentIdentityContent: string) => void) {
        super(app);
        this.agentId = agentId;
        this.agentIdentityContent = agentIdentityContent;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: `Agent Identity: ${this.agentId}` });

        new Setting(contentEl)
            .setName("Agent ID")
            .setDesc("The unique identifier for this agent.")
            .addText(text => text
                .setValue(this.agentId)
                .onChange(value => {
                    this.agentId = value;
                }));

        new Setting(contentEl)
            .setName("Agent Identity JSON")
            .setDesc("Edit the agent-identity.json content.")
            .addTextArea(text => text
                .setValue(this.agentIdentityContent)
                .onChange(value => {
                    this.agentIdentityContent = value;
                }));

        new Setting(contentEl)
            .addButton(button => button
                .setButtonText("Save")
                .setCta()
                .onClick(() => {
                    try {
                        JSON.parse(this.agentIdentityContent); // Validate JSON
                        this.onSubmit(this.agentId, this.agentIdentityContent);
                        this.close();
                    } catch (error) {
                        new Notice("Invalid JSON format for Agent Identity.");
                    }
                }));
    }

    onClose() {
        let { contentEl } = this;
        contentEl.empty();
    }
}
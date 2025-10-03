import { App, Notice, Plugin, WorkspaceLeaf, Platform, TFile, TAbstractFile } from 'obsidian';
import { OpencodeAgentClient } from './src/client';
import { IAgentVaultContext } from '../core/dist/mcp-types';
import { verifyProof } from '../core/dist/verification';
import { OpencodeAgentSettings, DEFAULT_SETTINGS, OpencodeAgentSettingTab } from './settings/settings';
import { GraphView, GRAPH_VIEW_TYPE } from './ui/GraphView';
import { CreateVaultModal } from './src/ui/CreateVaultModal';
import { ExecuteShellModal } from './src/ui/ExecuteShellModal';
import { AgentIdentityModal } from './src/ui/AgentIdentityModal';

const AGENT_IDENTITIES_PATH = 'agents/identities';

export default class OpencodeAgentPlugin extends Plugin {
    settings!: OpencodeAgentSettings;
    client!: OpencodeAgentClient; // Declare the client property

    async onload() {
        console.time("OpencodeAgentPlugin onload");
        await this.loadSettings();

        this.client = new OpencodeAgentClient();

        this.registerView(
            GRAPH_VIEW_TYPE,
            (leaf: WorkspaceLeaf) => new GraphView(leaf)
        );

        this.addCommand({
            id: 'connect-to-local-runtime',
            name: 'Connect to local agent runtime',
            callback: () => this.connectToLocalRuntime(),
        });

        this.addCommand({
            id: 'create-new-agent-vault',
            name: 'Create new agent vault',
            callback: () => {
                new CreateVaultModal(this.app, (vaultName: string) => {
                    if (vaultName) {
                        this.client.createAgentVault(vaultName);
                        new Notice(`Requesting creation of vault: ${vaultName}`);
                    }
                }).open();
            }
        });

        this.addCommand({
            id: 'execute-shell-command',
            name: 'Execute shell command in agent vault',
            callback: () => {
                new ExecuteShellModal(this.app, (vaultName: string, command: string) => {
                    if (vaultName && command) {
                        this.client.executeShell(vaultName, command);
                        new Notice(`Executing "${command}" in vault: ${vaultName}`);
                    }
                }).open();
            }
        });

        this.addCommand({
            id: 'manage-agent-identity',
            name: 'Manage Agent Identity',
            callback: async () => {
                const agentId = "default-agent"; // For now, hardcode a default agent ID
                const currentContent = await this.loadAgentIdentity(agentId);
                new AgentIdentityModal(this.app, agentId, currentContent, async (editedAgentId, editedContent) => {
                    await this.saveAgentIdentity(editedAgentId, editedContent);
                    new Notice(`Agent ${editedAgentId} identity saved.`);
                }).open();
            }
        });

        this.addCommand({
            id: 'push-context-to-agent',
            name: 'Push context to agent vault',
            callback: () => this.pushContextToAgent(),
        });

        this.addCommand({
            id: 'wikify-document',
            name: 'Wikify document (Agent Assist)',
            callback: () => this.wikifyDocument(),
        });

        this.addCommand({
            id: 'verify-node-history',
            name: 'Verify node history',
            callback: () => this.verifyNodeHistory(),
        });

        this.addCommand({
            id: 'publish-node-to-global',
            name: 'Publish node to global network',
            callback: () => this.publishNode(),
        });

        this.addCommand({
            id: 'commit-agent-state',
            name: 'Commit agent vault state',
            callback: () => {
                const modal = new ExecuteShellModal(this.app, (vaultName: string, agentId: string) => {
                    if (vaultName && agentId) {
                        this.client.commitState(vaultName, agentId);
                        new Notice(`Requesting state commit for vault: ${vaultName}`);
                    }
                });
                modal.titleEl.setText("Commit Agent State");
                // @ts-ignore
                modal.settingEl.setName("Agent ID");
                // @ts-ignore
                modal.settingEl.setPlaceholder("e.g., refactoring-agent-01");
                modal.open();
            }
        });

        this.addCommand({
            id: 'visualize-graph',
            name: 'Visualize graph',
            callback: () => this.visualizeGraph(),
        });

        this.addCommand({
            id: 'open-opencode-settings',
            name: 'Open Opencode Agent Settings',
            callback: () => {
                // @ts-ignore
                this.app.setting.open();
                // @ts-ignore
                this.app.setting.openTabById(OpencodeAgentSettingTab.ID);
            },
        });

        this.addSettingTab(new OpencodeAgentSettingTab(this.app, this));

        this.app.workspace.onLayoutReady(() => {
            this.connectToLocalRuntime();
        });
        console.timeEnd("OpencodeAgentPlugin onload");
    }

    onunload() {
        this.client.disconnect();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async saveSettingsToFile() {
        try {
            const filePath = 'opencode-agent-settings.json'; // Default file name
            const settingsJson = JSON.stringify(this.settings, null, 2);
            await this.app.vault.create(filePath, settingsJson);
            new Notice(`Settings saved to ${filePath}`);
        } catch (error: any) {
            new Notice(`Failed to save settings: ${error.message}`);
            console.error('Failed to save settings:', error);
        }
    }

    async loadSettingsFromFile() {
        try {
            const filePath = 'opencode-agent-settings.json'; // Default file name
            const file = this.app.vault.getAbstractFileByPath(filePath);

            if (!file || !(file instanceof TFile)) {
                new Notice(`Settings file ${filePath} not found.`);
                return;
            }

            const settingsJson = await this.app.vault.read(file);
            const loadedSettings: OpencodeAgentSettings = JSON.parse(settingsJson);
            this.settings = Object.assign({}, this.settings, loadedSettings);
            await this.saveSettings(); // Persist loaded settings
            new Notice(`Settings loaded from ${filePath}`);
        } catch (error: any) {
            new Notice(`Failed to load settings: ${error.message}`);
            console.error('Failed to load settings:', error);
        }
    }

    private getAgentIdentityFilePath(agentId: string): string {
        return `${AGENT_IDENTITIES_PATH}/${agentId}.json`;
    }

    async loadAgentIdentity(agentId: string): Promise<string> {
        try {
            const filePath = this.getAgentIdentityFilePath(agentId);
            const file = this.app.vault.getAbstractFileByPath(filePath);

            if (!file || !(file instanceof TFile)) {
                // If file not found, return empty JSON
                return "{}";
            }

            return await this.app.vault.read(file);
        } catch (error) {
            console.error(`Failed to load agent identity for ${agentId}:`, error);
            return "{}"; // Return empty JSON on error
        }
    }

    async saveAgentIdentity(agentId: string, content: string): Promise<void> {
        try {
            const filePath = this.getAgentIdentityFilePath(agentId);
            const file = this.app.vault.getAbstractFileByPath(filePath);

            if (file && file instanceof TFile) {
                await this.app.vault.modify(file, content);
            } else {
                // Ensure the directory exists
                const dirPath = AGENT_IDENTITIES_PATH;
                if (!await this.app.vault.adapter.exists(dirPath)) {
                    await this.app.vault.createFolder(dirPath);
                }
                await this.app.vault.create(filePath, content);
            }
            new Notice(`Agent identity for ${agentId} saved.`);
        } catch (error: any) {
            new Notice(`Failed to save agent identity for ${agentId}: ${error.message}`);
            console.error(`Failed to save agent identity for ${agentId}:`, error);
        }
    }

    async connectToLocalRuntime() {
        if (Platform.isMobile) {
            new Notice('Agent runtime connection is not available on mobile.');
            return;
        }

        try {
            const endpoint = this.settings.pluginEndpoint;

            if (!endpoint) {
                new Notice('Agent Runtime Endpoint is not configured in settings.');
                return;
            }

            await this.client.connect(endpoint);
            new Notice('Connected to local Agent Runtime!');

            this.client.onMessage(async (message: any) => {
                if (message.type === 'MCP_RESPONSE') {
                    const { requestId, payload } = message;
                    // Handle responses based on the original command's requestId if needed
                    // For now, we'll just log and show notices for specific command responses
                    if (payload.commandName === 'ExecuteShell') { // Assuming payload contains commandName for context
                        if (payload.error) {
                            new Notice(`Error executing command: ${payload.error}`);
                            console.error('Shell Error:', payload.stderr);
                        } else {
                            new Notice(`Command finished in ${payload.vaultName}.\nOutput: ${payload.stdout}`);
                            console.log('Shell Output:', payload.stdout);
                            console.error('Shell Stderr:', payload.stderr);
                        }
                    } else if (payload.commandName === 'CreateAgentVault') {
                        if (payload.error) {
                            new Notice(`Error creating vault: ${payload.error}`);
                        } else {
                            new Notice(`Vault created: ${payload.vaultName}`);
                        }
                    }
                    // Add more handlers for other command responses as needed
                } else if (message.type === 'MCP_ERROR') {
                    new Notice(`Agent Runtime Error: ${message.error}`);
                    console.error('Agent Runtime Error:', message.error);
                }
            });

        } catch (error: any) {
            new Notice('Failed to connect to local agent runtime. Is it running?');
            console.error(error);
        }
    }

    async pushContextToAgent() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('No active file to use as context.');
            return;
        }

        const content = await this.app.vault.read(activeFile);

        new CreateVaultModal(this.app, (vaultName: string) => {
            if (vaultName) {
                const context: IAgentVaultContext = {
                    vaultId: vaultName,
                    currentGoal: content,
                    systemPrompt: "You are an autonomous coding agent.",
                    stateSummary: "Context pushed from user vault.",
                    activeFiles: [activeFile.path],
                    availableTools: ['ExecuteShell']
                };
                this.client.setVaultContext(vaultName, context);
                new Notice(`Pushing context to vault: ${vaultName}`);
            }
        }).open();
    }

    async wikifyDocument() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('No active file to wikify.');
            return;
        }

        new Notice(`Wikifying document: ${activeFile.path}...`);
        const response = await this.client.wikifyAndTag(activeFile.path);

        if (response.error) {
            new Notice(`Wikification failed: ${response.error}`);
        } else {
            new Notice(`✅ Document wikified: ${response.message}`);
        }
    }

    async verifyNodeHistory() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('No active file to verify.');
            return;
        }

        const fileFrontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
        const nodeId = fileFrontmatter?.['tetranode_id'];
        const timestamp = activeFile.stat.mtime;

        if (!nodeId) {
            new Notice('Active file is not a valid TetraNode.');
            return;
        }

        new Notice(`Requesting proof for ${nodeId.substring(0, 12)} at time ${timestamp}...`);
        const response = await this.client.getHistoryProof(nodeId, timestamp);

        if (response.error) {
            new Notice(`Error getting proof: ${response.error}`);
            return;
        }

        const { root, value } = response;
        const proof = response.proof.map((p: string) => Buffer.from(p, 'hex'));

        const verifiedValue = await verifyProof(root, String(timestamp), proof);

        if (verifiedValue && verifiedValue.toString() === value) {
            new Notice(`✅ Proof VALID for timestamp ${timestamp}`);
        } else {
            new Notice(`❌ Proof INVALID for timestamp ${timestamp}`);
        }
    }

    async publishNode() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('No active file to publish.');
            return;
        }

        const fileFrontmatter = this.app.metadataCache.getFileCache(activeFile)?.frontmatter;
        const nodeId = fileFrontmatter?.['tetranode_id'];

        if (!nodeId) {
            new Notice(`Active file is not a valid TetraNode (missing tetranode_id). First, run the 'Create/update' command.`);
            return;
        }

        new Notice(`Publishing node ${nodeId.substring(0, 12)}... to global network.`);
        const response = await this.client.publishNode(nodeId);
        if (response.error) {
            new Notice(`Failed to publish: ${response.error}`);
        } else {
            new Notice(`Successfully published node ${nodeId.substring(0, 12)}.`);
        }
    }

    async visualizeGraph() {
        let leaf: WorkspaceLeaf | null = null;
        const leaves = this.app.workspace.getLeavesOfType(GRAPH_VIEW_TYPE);

        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = this.app.workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({ type: GRAPH_VIEW_TYPE, active: true });
            }
        }

        if (leaf) {
            this.app.workspace.revealLeaf(leaf);
        }
    }
}
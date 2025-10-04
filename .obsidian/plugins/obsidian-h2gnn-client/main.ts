import { App, Notice, Plugin, WorkspaceLeaf, Platform, TFile, TAbstractFile } from 'obsidian';
import { OpencodeAgentClient } from './src/client';
import { IAgentVaultContext } from '../core/dist/mcp-types';
import { verifyProof } from '../core/dist/verification';
import { OpencodeAgentSettings, DEFAULT_SETTINGS, OpencodeAgentSettingTab } from './settings/settings';
import { GraphView, GRAPH_VIEW_TYPE } from './ui/GraphView';
import { CreateVaultModal } from './src/ui/CreateVaultModal';
import { ExecuteShellModal } from './src/ui/ExecuteShellModal';
import { AgentIdentityModal } from './src/ui/AgentIdentityModal';
import { AgenticCodingInterface, AgenticCodingConfig } from './src/agentic-coding-interface';
import { H2GNNConfig } from './src/h2gnn-client';
import { AgenticCodingModal } from './src/ui/AgenticCodingModal';
import { KnowledgeGraphModal } from './src/ui/KnowledgeGraphModal';

const AGENT_IDENTITIES_PATH = 'agents/identities';

export default class OpencodeAgentPlugin extends Plugin {
    settings!: OpencodeAgentSettings;
    client!: OpencodeAgentClient; // Declare the client property
    agenticCoding!: AgenticCodingInterface; // H²GNN Agentic Coding Interface

    async onload() {
        console.time("OpencodeAgentPlugin onload");
        await this.loadSettings();

        this.client = new OpencodeAgentClient();
        
        // Initialize H²GNN Agentic Coding Interface
        const h2gnnConfig: H2GNNConfig = {
            h2gnnServerPath: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/h2gnn-mcp-server.ts',
            knowledgeGraphServerPath: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/knowledge-graph-mcp-server.ts',
            lspAstServerPath: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/lsp-ast-mcp-server.ts',
            geometricToolsServerPath: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/geometric-tools-mcp-server.ts',
            enhancedH2gnnServerPath: '/home/main/devops/hyperbolic-geometric-neural-network/src/mcp/h2gnn-mcp-server.ts' // Using consolidated server
        };

        const agenticCodingConfig: AgenticCodingConfig = {
            h2gnnConfig,
            autoConnect: true,
            learningSessionName: 'obsidian-agentic-coding',
            focusDomain: 'coding'
        };

        this.agenticCoding = new AgenticCodingInterface(this.app, agenticCodingConfig);

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

        // H²GNN Agentic Coding Commands
        this.addCommand({
            id: 'h2gnn-agentic-coding',
            name: '🤖 H²GNN Agentic Coding',
            callback: () => {
                new AgenticCodingModal(this.app, this.agenticCoding).open();
            },
        });

        this.addCommand({
            id: 'h2gnn-knowledge-graph',
            name: '🧠 H²GNN Knowledge Graph',
            callback: () => {
                new KnowledgeGraphModal(this.app, this.agenticCoding).open();
            },
        });

        this.addCommand({
            id: 'h2gnn-generate-code',
            name: '⚡ Generate Code with H²GNN',
            callback: () => this.generateCodeWithH2GNN(),
        });

        this.addCommand({
            id: 'h2gnn-analyze-code',
            name: '🔍 Analyze Code with H²GNN',
            callback: () => this.analyzeCodeWithH2GNN(),
        });

        this.addCommand({
            id: 'h2gnn-refactor-code',
            name: '🔧 Refactor Code with H²GNN',
            callback: () => this.refactorCodeWithH2GNN(),
        });

        this.addCommand({
            id: 'h2gnn-generate-docs',
            name: '📚 Generate Documentation with H²GNN',
            callback: () => this.generateDocumentationWithH2GNN(),
        });

        this.addCommand({
            id: 'h2gnn-query-knowledge',
            name: '🧠 Query Knowledge Graph',
            callback: () => this.queryKnowledgeGraph(),
        });

        this.addCommand({
            id: 'h2gnn-learning-progress',
            name: '📊 Get Learning Progress',
            callback: () => this.getLearningProgress(),
        });

        this.addCommand({
            id: 'h2gnn-system-status',
            name: '🔍 Get System Status',
            callback: () => this.getSystemStatus(),
        });

        this.addCommand({
            id: 'h2gnn-consolidate-memories',
            name: '🧠 Consolidate Memories',
            callback: () => this.consolidateMemories(),
        });

        this.addCommand({
            id: 'h2gnn-test-connection',
            name: '🔌 Test H²GNN Connection',
            callback: () => this.testH2GNNConnection(),
        });

        this.addCommand({
            id: 'h2gnn-start-servers',
            name: '🚀 Start H²GNN MCP Servers',
            callback: () => this.startH2GNNServers(),
        });

        this.addCommand({
            id: 'h2gnn-stop-servers',
            name: '🛑 Stop H²GNN MCP Servers',
            callback: () => this.stopH2GNNServers(),
        });

        this.addSettingTab(new OpencodeAgentSettingTab(this.app, this));

        this.app.workspace.onLayoutReady(async () => {
            // Initialize H²GNN Agentic Coding Interface (this handles MCP server connections)
            try {
                await this.agenticCoding.initialize();
                new Notice('✅ H²GNN Agentic Coding Interface initialized');
            } catch (error) {
                console.error('Failed to initialize H²GNN Agentic Coding Interface:', error);
                new Notice('⚠️ H²GNN Agentic Coding Interface initialized in limited mode');
            }
            
            // Optional: Connect to legacy agent runtime if needed
            // this.connectToLocalRuntime();
        });
        console.timeEnd("OpencodeAgentPlugin onload");
    }

    onunload() {
        this.client.disconnect();
        this.agenticCoding.disconnect();
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

    // H²GNN Agentic Coding Methods
    async generateCodeWithH2GNN() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('❌ No active file to use as context');
            return;
        }

        const content = await this.app.vault.read(activeFile);
        const context = `File: ${activeFile.path}\n\nContent:\n${content}`;
        
        try {
            new Notice('🤖 Generating code with H²GNN...');
            const result = await this.agenticCoding.generateCode({
                context,
                requirements: 'Generate relevant code based on the file content',
                language: 'typescript',
                includeComments: true,
                includeTests: false
            });

            if (result.success) {
                new Notice('✅ Code generated successfully');
                console.log('Generated code:', result.data);
            } else {
                new Notice(`❌ Code generation failed: ${result.error}`);
            }
        } catch (error) {
            new Notice(`❌ Error: ${error.message}`);
        }
    }

    async analyzeCodeWithH2GNN() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('❌ No active file to analyze');
            return;
        }

        const content = await this.app.vault.read(activeFile);
        
        try {
            new Notice('🔍 Analyzing code with H²GNN...');
            const result = await this.agenticCoding.analyzeCode(content, 'typescript', activeFile.path);

            if (result.success) {
                new Notice('✅ Code analysis completed');
                console.log('Analysis result:', result.data);
            } else {
                new Notice(`❌ Code analysis failed: ${result.error}`);
            }
        } catch (error) {
            new Notice(`❌ Error: ${error.message}`);
        }
    }

    async refactorCodeWithH2GNN() {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('❌ No active file to refactor');
            return;
        }

        const content = await this.app.vault.read(activeFile);
        
        try {
            new Notice('🔧 Refactoring code with H²GNN...');
            const result = await this.agenticCoding.performRefactoring({
                code: content,
                refactoringType: 'improve_readability',
                language: 'typescript',
                autoApply: true
            });

            if (result.success) {
                new Notice('✅ Code refactored successfully');
                console.log('Refactored code:', result.data);
            } else {
                new Notice(`❌ Refactoring failed: ${result.error}`);
            }
        } catch (error) {
            new Notice(`❌ Error: ${error.message}`);
        }
    }

    async generateDocumentationWithH2GNN() {
        const vaultPath = this.app.vault.adapter.basePath;
        
        try {
            new Notice('📚 Generating documentation with H²GNN...');
            const result = await this.agenticCoding.generateDocumentation({
                codebasePath: vaultPath,
                outputFormat: 'markdown',
                targetAudience: 'developer',
                detailLevel: 'high',
                includeExamples: true,
                includeDiagrams: true
            });

            if (result.success) {
                new Notice('✅ Documentation generated successfully');
                console.log('Documentation result:', result.data);
            } else {
                new Notice(`❌ Documentation generation failed: ${result.error}`);
            }
        } catch (error) {
            new Notice(`❌ Error: ${error.message}`);
        }
    }

    async queryKnowledgeGraph() {
        try {
            new Notice('🧠 Querying knowledge graph...');
            const result = await this.agenticCoding.queryKnowledgeGraph(
                'What are the main concepts and relationships in this codebase?',
                'similarity',
                10
            );

            if (result.success) {
                new Notice('✅ Knowledge graph query completed');
                console.log('Knowledge graph result:', result.data);
            } else {
                new Notice(`❌ Knowledge graph query failed: ${result.error}`);
            }
        } catch (error) {
            new Notice(`❌ Error: ${error.message}`);
        }
    }

    async getLearningProgress() {
        try {
            new Notice('📊 Getting learning progress...');
            const result = await this.agenticCoding.getLearningProgress();

            if (result.success) {
                new Notice('✅ Learning progress retrieved');
                console.log('Learning progress:', result.data);
            } else {
                new Notice(`❌ Failed to get learning progress: ${result.error}`);
            }
        } catch (error) {
            new Notice(`❌ Error: ${error.message}`);
        }
    }

    async getSystemStatus() {
        try {
            new Notice('🔍 Getting system status...');
            const result = await this.agenticCoding.getSystemStatus();

            if (result.success) {
                new Notice('✅ System status retrieved');
                console.log('System status:', result.data);
            } else {
                new Notice(`❌ Failed to get system status: ${result.error}`);
            }
        } catch (error) {
            new Notice(`❌ Error: ${error.message}`);
        }
    }

    async consolidateMemories() {
        try {
            new Notice('🧠 Consolidating memories...');
            const result = await this.agenticCoding.consolidateMemories();

            if (result.success) {
                new Notice('✅ Memories consolidated successfully');
                console.log('Memory consolidation result:', result.data);
            } else {
                new Notice(`❌ Memory consolidation failed: ${result.error}`);
            }
        } catch (error) {
            new Notice(`❌ Error: ${error.message}`);
        }
    }

    async testH2GNNConnection() {
        try {
            new Notice('🔌 Testing H²GNN connection...');
            
            // Check if agentic coding interface is initialized
            if (!this.agenticCoding) {
                new Notice('❌ H²GNN Agentic Coding Interface not initialized');
                return;
            }

            // Check connection status
            const isConnected = this.agenticCoding.getConnectionStatus();
            const availableServers = this.agenticCoding.getAvailableServers();
            
            if (isConnected) {
                new Notice(`✅ H²GNN connected! Available servers: ${availableServers.join(', ')}`);
                console.log('Available servers:', availableServers);
            } else {
                new Notice('❌ H²GNN not connected. Try starting the MCP servers first.');
            }
        } catch (error) {
            new Notice(`❌ Connection test failed: ${error.message}`);
            console.error('Connection test error:', error);
        }
    }

    async startH2GNNServers() {
        try {
            new Notice('🚀 Starting H²GNN MCP servers...');
            
            // This is a placeholder - in a real implementation, you would start the servers
            // For now, we'll just show a message about the servers
            new Notice('💡 MCP servers should be started manually. Run: npx tsx src/mcp/h2gnn-mcp-server.ts');
            console.log('To start H²GNN MCP servers manually, run:');
            console.log('cd /home/main/devops/hyperbolic-geometric-neural-network');
            console.log('npx tsx src/mcp/h2gnn-mcp-server.ts');
            console.log('npx tsx src/mcp/knowledge-graph-mcp-server.ts');
            console.log('npx tsx src/mcp/lsp-ast-mcp-server.ts');
            console.log('npx tsx src/mcp/geometric-tools-mcp-server.ts');
        } catch (error) {
            new Notice(`❌ Failed to start servers: ${error.message}`);
            console.error('Start servers error:', error);
        }
    }

    async stopH2GNNServers() {
        try {
            new Notice('🛑 Stopping H²GNN MCP servers...');
            
            // This is a placeholder - in a real implementation, you would stop the servers
            // For now, we'll just show a message about stopping the servers
            new Notice('💡 MCP servers should be stopped manually. Run: pkill -f mcp-server.ts');
            console.log('To stop H²GNN MCP servers manually, run:');
            console.log('pkill -f h2gnn-mcp-server.ts');
            console.log('pkill -f knowledge-graph-mcp-server.ts');
            console.log('pkill -f lsp-ast-mcp-server.ts');
            console.log('pkill -f geometric-tools-mcp-server.ts');
        } catch (error) {
            new Notice(`❌ Failed to stop servers: ${error.message}`);
            console.error('Stop servers error:', error);
        }
    }
}
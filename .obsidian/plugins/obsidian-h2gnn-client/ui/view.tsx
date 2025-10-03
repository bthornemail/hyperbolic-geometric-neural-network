import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from './context';
import { App } from 'obsidian';
import { OpencodeAgentClient } from '../src/client'; // Assuming client is accessible
import { TetraNode} from '../../core/dist/TetraNode';

const useApp = (): App | undefined => {
    return useContext(AppContext);
};

// A mock client for now, in a real app this would be passed via context
const client = new OpencodeAgentClient();

export const GraphComponent = () => {
    const app = useApp();
    const [nodes, setNodes] = useState<TetraNode[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to the agent runtime and fetch nodes
        const connectAndFetch = async () => {
            try {
                // @ts-ignore - Reading private vault config
                const configContent = await app.vault.adapter.read('agent-config.json');
                const config = JSON.parse(configContent);
                await client.connect(config.pluginEndpoint);
                setIsConnected(true);

                const fetchedNodes = await client.getAllNodes();
                setNodes(fetchedNodes);
            } catch (error) {
                console.error("Failed to connect or fetch nodes:", error);
            }
        };

        connectAndFetch();

        return () => {
            client.disconnect();
        };
    }, [app]);

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Shared Brain Graph Visualization</h2>
            <p>Vault: {app?.vault.getName()}</p>
            <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
            <hr />
            <h3>Processed Nodes ({nodes.length})</h3>
            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                {nodes.length === 0 && <p>No nodes processed yet. Save a formatted note in the 'notes' directory.</p>}
                <ul>
                    {nodes.map(node => (
                        <li key={node.nodeId} style={{ marginBottom: '0.5rem', fontFamily: 'monospace', fontSize: '12px' }}>
                            <strong>ID:</strong> {node.nodeId.substring(0, 15)}...<br />
                            <strong>Centroid:</strong> {node.staticCentroid.substring(0, 15)}...
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

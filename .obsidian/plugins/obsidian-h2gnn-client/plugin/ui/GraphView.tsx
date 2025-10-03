import { StrictMode } from "react";
import { ItemView, WorkspaceLeaf, App } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { GraphComponent } from "./view";
import { AppContext } from "./context";

export const GRAPH_VIEW_TYPE = "graph-view";

export class GraphView extends ItemView {
    root: Root | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return GRAPH_VIEW_TYPE;
    }

    getDisplayText() {
        return "Shared Brain Graph";
    }

    async onOpen() {
        this.root = createRoot(this.contentEl);
        this.root.render(
            <StrictMode>
                <AppContext.Provider value={this.app}>
                    <GraphComponent />
                </AppContext.Provider>
            </StrictMode>
        );
    }

    async onClose() {
        this.root?.unmount();
    }
}

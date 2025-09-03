import { getFromDB, openDB, saveToDB } from "@/lib/indexedDB";
import { create } from "zustand";

export interface Page {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  charCount: number;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  pages: Page[];
  currentPageId: string | null;
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentPage: Page | null;
  isLoading: boolean;
  error: string | null;
  
  // Workspace actions
  createWorkspace: (name: string, color: string) => Promise<string>;
  deleteWorkspace: (id: string) => Promise<void>;
  setCurrentWorkspace: (id: string) => Promise<void>;
  renameWorkspace: (id: string, newName: string) => Promise<void>;
  
  // Page actions
  createPage: (title: string) => Promise<string>;
  deletePage: (pageId: string) => Promise<void>;
  setCurrentPage: (pageId: string) => Promise<void>;
  updatePageContent: (pageId: string, content: string, title?: string) => Promise<void>;
  duplicatePage: (pageId: string) => Promise<void>;
  
  // Data management
  loadWorkspaces: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  exportPage: (pageId: string, format: 'txt' | 'html' | 'md') => void;
  clearError: () => void;
}

const DB_NAME = "WritingApp";
const STORE_NAME = "workspaces";

// Helper functions for localStorage persistence
const persistCurrentWorkspace = (workspaceId: string | null) => {
  if (typeof window !== 'undefined') {
    if (workspaceId) {
      localStorage.setItem('currentWorkspaceId', workspaceId);
    } else {
      localStorage.removeItem('currentWorkspaceId');
    }
  }
};

const getPersistedWorkspaceId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentWorkspaceId');
  }
  return null;
};

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspaceId: null,
  currentPage: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  createWorkspace: async (name: string, color: string) => {
    try {
      console.log('Creating workspace:', name, color);
      
      const newWorkspace: Workspace = {
        id: crypto.randomUUID(),
        name,
        color,
        pages: [],
        currentPageId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        currentWorkspaceId: newWorkspace.id,
        currentPage: null, // Clear current page when creating new workspace
        error: null,
      }));

      // Persist the new workspace ID
      persistCurrentWorkspace(newWorkspace.id);

      await get().saveToStorage();
      console.log('Workspace created successfully');
      return newWorkspace.id;
    } catch (error) {
      console.error('Failed to create workspace:', error);
      set({ error: 'Failed to create workspace' });
      return "";
    }
  },

  deleteWorkspace: async (id: string) => {
    try {
      const { workspaces, currentWorkspaceId } = get();
      const updatedWorkspaces = workspaces.filter(ws => ws.id !== id);
      
      let newCurrentId = null;
      let newCurrentPage = null;

      if (updatedWorkspaces.length > 0) {
        // Switch to first available workspace if we deleted the current one
        newCurrentId = currentWorkspaceId === id ? updatedWorkspaces[0].id : currentWorkspaceId;
        const newCurrentWorkspace = updatedWorkspaces.find(ws => ws.id === newCurrentId);
        newCurrentPage = newCurrentWorkspace?.currentPageId 
          ? newCurrentWorkspace.pages.find(p => p.id === newCurrentWorkspace.currentPageId) || null
          : null;
      }

      set({
        workspaces: updatedWorkspaces,
        currentWorkspaceId: newCurrentId,
        currentPage: currentWorkspaceId === id ? newCurrentPage : get().currentPage,
        error: null,
      });

      // Update persistence
      persistCurrentWorkspace(newCurrentId);

      await get().saveToStorage();
      console.log('Workspace deleted successfully');
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      set({ error: 'Failed to delete workspace' });
    }
  },

  setCurrentWorkspace: async (id: string) => {
    try {
      const { workspaces } = get();
      const workspace = workspaces.find(ws => ws.id === id);
      
      if (workspace) {
        const currentPage = workspace.currentPageId 
          ? workspace.pages.find(p => p.id === workspace.currentPageId) || null
          : null;

        set({
          currentWorkspaceId: id,
          currentPage, // This will be null for new/empty workspaces
          error: null,
        });

        // Persist the workspace change
        persistCurrentWorkspace(id);
        await get().saveToStorage();

        console.log('Switched to workspace:', workspace.name);
      }
    } catch (error) {
      console.error('Failed to set current workspace:', error);
      set({ error: 'Failed to switch workspace' });
    }
  },

  renameWorkspace: async (id: string, newName: string) => {
    try {
      set((state) => ({
        workspaces: state.workspaces.map(ws => 
          ws.id === id 
            ? { ...ws, name: newName, updatedAt: Date.now() }
            : ws
        ),
        error: null,
      }));

      await get().saveToStorage();
      console.log('Workspace renamed successfully');
    } catch (error) {
      console.error('Failed to rename workspace:', error);
      set({ error: 'Failed to rename workspace' });
    }
  },

  createPage: async (title: string = "Untitled") => {
    try {
      const { currentWorkspaceId, workspaces } = get();
      if (!currentWorkspaceId) {
        console.error('No current workspace to create page in');
        return "";
      }

      const newPage: Page = {
        id: crypto.randomUUID(),
        title,
        content: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        wordCount: 0,
        charCount: 0,
      };

      set((state) => ({
        workspaces: state.workspaces.map(ws => 
          ws.id === currentWorkspaceId
            ? { 
                ...ws, 
                pages: [...ws.pages, newPage], 
                currentPageId: newPage.id,
                updatedAt: Date.now(),
              }
            : ws
        ),
        currentPage: newPage,
        error: null,
      }));

      await get().saveToStorage();
      console.log('Page created successfully:', title);
      return newPage.id;
    } catch (error) {
      console.error('Failed to create page:', error);
      set({ error: 'Failed to create page' });
      return "";
    }
  },

  deletePage: async (pageId: string) => {
    try {
      const { currentWorkspaceId, workspaces, currentPage } = get();
      if (!currentWorkspaceId) return;

      const workspace = workspaces.find(ws => ws.id === currentWorkspaceId);
      if (!workspace) return;

      const updatedPages = workspace.pages.filter(p => p.id !== pageId);
      const newCurrentPageId = currentPage?.id === pageId 
        ? (updatedPages[0]?.id || null)
        : workspace.currentPageId;

      const newCurrentPage = newCurrentPageId 
        ? updatedPages.find(p => p.id === newCurrentPageId) || null
        : null;

      set((state) => ({
        workspaces: state.workspaces.map(ws => 
          ws.id === currentWorkspaceId
            ? { 
                ...ws, 
                pages: updatedPages, 
                currentPageId: newCurrentPageId,
                updatedAt: Date.now(),
              }
            : ws
        ),
        currentPage: newCurrentPage,
        error: null,
      }));

      await get().saveToStorage();
      console.log('Page deleted successfully');
    } catch (error) {
      console.error('Failed to delete page:', error);
      set({ error: 'Failed to delete page' });
    }
  },

  setCurrentPage: async (pageId: string) => {
    try {
      const { currentWorkspaceId, workspaces } = get();
      if (!currentWorkspaceId) return;

      const workspace = workspaces.find(ws => ws.id === currentWorkspaceId);
      const page = workspace?.pages.find(p => p.id === pageId);

      if (page) {
        set((state) => ({
          workspaces: state.workspaces.map(ws => 
            ws.id === currentWorkspaceId
              ? { ...ws, currentPageId: pageId }
              : ws
          ),
          currentPage: page,
          error: null,
        }));

        await get().saveToStorage();
        console.log('Current page set successfully');
      }
    } catch (error) {
      console.error('Failed to set current page:', error);
      set({ error: 'Failed to switch page' });
    }
  },

  updatePageContent: async (pageId: string, content: string, title?: string) => {
    try {
      const { currentWorkspaceId } = get();
      if (!currentWorkspaceId) return;

      const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
      const charCount = content.length;

      set((state) => ({
        workspaces: state.workspaces.map(ws => 
          ws.id === currentWorkspaceId
            ? {
                ...ws,
                pages: ws.pages.map(p => 
                  p.id === pageId
                    ? { 
                        ...p, 
                        content, 
                        title: title !== undefined ? title : p.title,
                        updatedAt: Date.now(),
                        wordCount,
                        charCount,
                      }
                    : p
                ),
                updatedAt: Date.now(),
              }
            : ws
        ),
        currentPage: state.currentPage?.id === pageId 
          ? { 
              ...state.currentPage, 
              content, 
              title: title !== undefined ? title : state.currentPage.title,
              updatedAt: Date.now(),
              wordCount,
              charCount,
            }
          : state.currentPage,
        error: null,
      }));

      await get().saveToStorage();
    } catch (error) {
      console.error('Failed to update page content:', error);
      set({ error: 'Failed to save content' });
    }
  },

  duplicatePage: async (pageId: string) => {
    try {
      const { currentWorkspaceId, workspaces } = get();
      if (!currentWorkspaceId) return;

      const workspace = workspaces.find(ws => ws.id === currentWorkspaceId);
      const originalPage = workspace?.pages.find(p => p.id === pageId);
      
      if (!originalPage) return;

      const duplicatedPage: Page = {
        ...originalPage,
        id: crypto.randomUUID(),
        title: `${originalPage.title} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set((state) => ({
        workspaces: state.workspaces.map(ws => 
          ws.id === currentWorkspaceId
            ? { 
                ...ws, 
                pages: [...ws.pages, duplicatedPage],
                updatedAt: Date.now(),
              }
            : ws
        ),
        error: null,
      }));

      await get().saveToStorage();
      console.log('Page duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate page:', error);
      set({ error: 'Failed to duplicate page' });
    }
  },

  loadWorkspaces: async () => {
    console.log('Starting to load workspaces...');
    set({ isLoading: true, error: null });
    
    try {
      console.log('Opening database...');
      const db = await openDB(DB_NAME, STORE_NAME);
      
      console.log('Getting data from database...');
      const data = await getFromDB(db, STORE_NAME, "workspaces");
      
      if (data) {
        console.log('Found existing data, parsing...');
        const workspaces = JSON.parse(data);
        console.log('Parsed workspaces:', workspaces);
        
        if (workspaces.length === 0) {
          // No workspaces exist - this will trigger the create workspace modal
          set({ 
            workspaces: [], 
            currentWorkspaceId: null, 
            currentPage: null,
            isLoading: false 
          });
          persistCurrentWorkspace(null);
          console.log('No workspaces found - will show create modal');
          return;
        }

        // Try to restore the persisted workspace
        const persistedId = getPersistedWorkspaceId();
        const validWorkspace = workspaces.find((ws: Workspace) => ws.id === persistedId);
        
        const currentId = validWorkspace ? persistedId : workspaces[0].id;
        const currentWorkspace = workspaces.find((ws: Workspace) => ws.id === currentId);
        const currentPage = currentWorkspace?.currentPageId 
          ? currentWorkspace.pages.find((p: Page) => p.id === currentWorkspace.currentPageId) || null
          : null;

        set({ 
          workspaces, 
          currentWorkspaceId: currentId,
          currentPage,
          isLoading: false,
          error: null,
        });

        // Update persisted value if it changed
        if (currentId !== persistedId) {
          persistCurrentWorkspace(currentId);
        }
        
        console.log('Workspaces loaded successfully');
      } else {
        console.log('No existing data found - will show create workspace modal');
        
        // No data exists - this will trigger the create workspace modal
        set({ 
          workspaces: [], 
          currentWorkspaceId: null,
          currentPage: null,
          isLoading: false,
          error: null,
        });
        
        persistCurrentWorkspace(null);
        console.log('No data found - will show create modal');
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
      set({ 
        isLoading: false, 
        error: 'Failed to load workspaces. Please refresh the page.' 
      });
    }
  },

  saveToStorage: async () => {
    try {
      const { workspaces } = get();
      console.log('Saving workspaces to storage...');
      
      const db = await openDB(DB_NAME, STORE_NAME);
      await saveToDB(db, STORE_NAME, "workspaces", JSON.stringify(workspaces));
      
      console.log('Workspaces saved to storage successfully');
    } catch (error) {
      console.error("Failed to save workspaces:", error);
      set({ error: 'Failed to save data' });
    }
  },

  exportPage: (pageId: string, format: 'txt' | 'html' | 'md') => {
    const { currentWorkspaceId, workspaces } = get();
    if (!currentWorkspaceId) return;

    const workspace = workspaces.find(ws => ws.id === currentWorkspaceId);
    const page = workspace?.pages.find(p => p.id === pageId);
    
    if (!page) return;

    let content = page.content;
    let mimeType = 'text/plain';
    let fileName = `${page.title}.txt`;

    switch (format) {
      case 'html':
        content = `<!DOCTYPE html>
<html>
<head>
    <title>${page.title}</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>${page.title}</h1>
    <div>${page.content.replace(/\n/g, '<br>')}</div>
    <hr>
    <small>Created: ${new Date(page.createdAt).toLocaleDateString()}</small>
</body>
</html>`;
        mimeType = 'text/html';
        fileName = `${page.title}.html`;
        break;
      
      case 'md':
        content = `# ${page.title}\n\n${page.content}\n\n---\n*Created: ${new Date(page.createdAt).toLocaleDateString()}*`;
        mimeType = 'text/markdown';
        fileName = `${page.title}.md`;
        break;
      
      default:
        content = `${page.title}\n${'='.repeat(page.title.length)}\n\n${page.content}\n\n---\nCreated: ${new Date(page.createdAt).toLocaleDateString()}`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
}));
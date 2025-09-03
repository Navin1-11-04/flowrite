import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Plus, Trash, Edit3, AlertTriangle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useWorkspace } from "@/store/useWorkspace";

const colorOptions = [
  { name: "Red", class: "bg-red-300" },
  { name: "Orange", class: "bg-orange-300" },
  { name: "Yellow", class: "bg-yellow-300" },
  { name: "Green", class: "bg-green-300" },
  { name: "Blue", class: "bg-blue-300" },
  { name: "Purple", class: "bg-purple-300" },
  { name: "Pink", class: "bg-pink-300" },
];

export function Groups() {
  const { 
    workspaces, 
    currentWorkspaceId, 
    createWorkspace, 
    deleteWorkspace, 
    setCurrentWorkspace,
    renameWorkspace,
    isLoading,
  } = useWorkspace();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].class);
  const [workspaceToRename, setWorkspaceToRename] = useState<string | null>(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // REMOVED: loadWorkspaces() call from useEffect to prevent infinite loops
  // The workspaces should be loaded from the parent component

  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);

  const handleTriggerClick = () => {
    if (chevronRef.current) {
      gsap.to(chevronRef.current, { rotate: 180, duration: 0.3, ease: "power2.out" });
    }
    if (indicatorRef.current) {
      gsap.to(indicatorRef.current, { scale: 1.1, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 });
    }
  };

  const handleTriggerHover = (isEntering: boolean) => {
    if (triggerRef.current) {
      gsap.to(triggerRef.current, { scale: isEntering ? 1.02 : 1, duration: 0.2, ease: "power2.out" });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && chevronRef.current) {
      gsap.to(chevronRef.current, { rotate: 0, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleCreateWorkspace = async () => {
    if (newWorkspaceName.trim()) {
      await createWorkspace(newWorkspaceName.trim(), selectedColor);
      setNewWorkspaceName("");
      setSelectedColor(colorOptions[0].class);
      setIsCreateDialogOpen(false);
    }
  };

  const handleRenameWorkspace = async () => {
    if (workspaceToRename && newWorkspaceName.trim()) {
      await renameWorkspace(workspaceToRename, newWorkspaceName.trim());
      setWorkspaceToRename(null);
      setNewWorkspaceName("");
      setIsRenameDialogOpen(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (workspaceToDelete) {
      await deleteWorkspace(workspaceToDelete);
      setWorkspaceToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openRenameDialog = (workspace: any) => {
    setWorkspaceToRename(workspace.id);
    setNewWorkspaceName(workspace.name);
    setIsRenameDialogOpen(true);
  };

  const openDeleteDialog = (workspace: any) => {
    setWorkspaceToDelete(workspace.id);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading || !currentWorkspace) {
    return (
      <div className="flex items-center">
        <div className="w-4 h-4 mr-2.5 rounded-full bg-gray-300 animate-pulse" />
        <div className="h-4 bg-gray-300 rounded w-20 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger
          ref={triggerRef}
          className="flex items-center bg-background outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-1 py-1 transition-all duration-200 ease-out"
          onClick={handleTriggerClick}
          onMouseEnter={() => handleTriggerHover(true)}
          onMouseLeave={() => handleTriggerHover(false)}
        >
          <span
            ref={indicatorRef}
            className={cn(
              "w-3.5 h-3.5 md:w-4.5 md:h-4.5 mr-2 md:mr-2.5 rounded-full flex-shrink-0 transition-all duration-200 ease-out",
              currentWorkspace.color
            )}
          />
          <div className="flex items-center text-foreground min-w-0">
            <h1 className="text-xs font-medium md:font-[450] md:text-sm truncate max-w-20 sm:max-w-25 md:max-w-32 transition-colors duration-200">
              {currentWorkspace.name}
            </h1>
            <ChevronsUpDown
              ref={chevronRef}
              className="ml-2 md:ml-3 size-3 md:size-3.5 text-muted-foreground flex-shrink-0 transition-all duration-300 ease-out"
            />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-36 md:w-40 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          side="bottom"
          align="start"
          sideOffset={10}
          alignOffset={-12}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
            Workspaces
          </DropdownMenuLabel>

          {workspaces.map((workspace, index) => (
            <DropdownMenuItem
              key={workspace.id}
              className={cn(
                "flex items-center gap-2 md:gap-2.5 my-1 text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-200 ease-out hover:bg-accent/50 group",
                workspace.id === currentWorkspaceId && "text-foreground font-[450] bg-accent"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setCurrentWorkspace(workspace.id)}
            >
              <span 
                className={cn(
                  "w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                  workspace.color
                )} 
              />
              <p className="text-xs md:text-sm truncate flex-1">{workspace.name}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRenameDialog(workspace);
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                {workspaces.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(workspace);
                    }}
                  >
                    <Trash className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            className="flex items-center text-muted-foreground focus:text-foreground hover:text-foreground transition-all duration-200 ease-out my-1 cursor-pointer group hover:bg-accent/50"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="size-3.5 md:size-4 mr-1 text-inherit transition-transform duration-200 group-hover:scale-110" strokeWidth={2.5} />
            <p className="text-xs md:text-sm">New Workspace</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your pages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Choose a color:</p>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.class}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all duration-200",
                      color.class,
                      selectedColor === color.class 
                        ? "border-foreground scale-110" 
                        : "border-border hover:border-muted-foreground hover:scale-105"
                    )}
                    onClick={() => setSelectedColor(color.class)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Workspace Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Workspace</DialogTitle>
            <DialogDescription>
              Enter a new name for your workspace.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameWorkspace()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameWorkspace} disabled={!newWorkspaceName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Workspace Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Workspace
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workspace? This action cannot be undone and will delete all pages within it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorkspace}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
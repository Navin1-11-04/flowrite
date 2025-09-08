"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronsUpDown,
  Plus,
  Trash,
  Loader2,
  FolderPlus,
  Check,
  List,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
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
  { name: "Indigo", class: "bg-indigo-300" },
  { name: "Cyan", class: "bg-cyan-300" },
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

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const currentWorkspace = workspaces.find((ws) => ws.id === currentWorkspaceId);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && chevronRef.current) {
      gsap.to(chevronRef.current, { rotate: 0, duration: 0.3, ease: "power2.out" });
    } else if (open && chevronRef.current) {
      gsap.to(chevronRef.current, { rotate: 180, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleRename = async () => {
    if (currentWorkspace && editName.trim() && editName !== currentWorkspace.name) {
      await renameWorkspace(currentWorkspace.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCreate = async () => {
    if (newWorkspaceName.trim()) {
      setIsCreating(true);
      try {
        await createWorkspace(newWorkspaceName.trim(), selectedColor.class);
        setNewWorkspaceName("");
        setSelectedColor(colorOptions[0]);
        setIsOpen(false);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleDelete = async () => {
    if (currentWorkspace && workspaces.length > 1) {
      setIsDeleting(true);
      try {
        await deleteWorkspace(currentWorkspace.id);
        setIsOpen(false);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleWorkspaceSelect = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    setIsOpen(false);
  };

  if (isLoading || !currentWorkspace) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-4 h-4 rounded-full bg-muted" />
        <div className="h-4 bg-muted rounded w-24" />
        <div className="w-4 h-4 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center font-poppins">
      <div
        className={cn(
          "w-4 h-4 md:w-4 md:h-4 mr-3 rounded-full flex-shrink-0",
          currentWorkspace.color
        )}
      />
      <div className="group mr-1 flex items-center min-w-0 flex-1 max-w-30 md:max-w-34 rounded-xs hover:bg-secondary transition-colors h-6">
  {isEditing ? (
    <Input
      ref={editInputRef}
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      onBlur={handleRename}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleRename();
        if (e.key === "Escape") setIsEditing(false);
      }}
      className="text-sm md:text-base h-full font-medium truncate border-0 border-b-2 rounded-xs focus-visible:ring-0 focus-visible:border-primary/50 px-0 py-0 leading-relaxed"
    />
  ) : (
    <h1
      className="text-sm font-medium truncate cursor-pointer hover:text-primary transition-colors"
      onClick={() => {
        setIsEditing(true);
        setEditName(currentWorkspace.name);
      }}
    >
      {currentWorkspace.name}
    </h1>
  )}
</div>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-secondary hover:text-primary text-muted-foreground rounded-xs"
            aria-expanded={isOpen}
            aria-label="Open workspace selector"
          >
            <ChevronsUpDown
              ref={chevronRef}
              className="h-3 w-3 text-inherit transition-all duration-300 ease-out"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
  className="w-70 p-1 z-[999] rounded-lg shadow-lg backdrop-blur-xs font-poppins 
             sm:max-w-[280px] max-w-[calc(100vw-2rem)] mx-auto"
  align="end"
  side="bottom"
  sideOffset={16}
  alignOffset={-60}
  collisionPadding={12}
>
          <Command className="px-2 py-1">
            <CommandInput placeholder="Search workspaces..." className="h-10 p-1" />
            <CommandList className="max-h-64 overflow-y-auto py-1">
              <CommandEmpty>No workspaces found.</CommandEmpty>
              <CommandGroup heading="Workspaces" className="font-medium">
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    value={workspace.name}
                    onSelect={() => handleWorkspaceSelect(workspace.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2 rounded-xs my-1",
                      workspace.id === currentWorkspaceId && ""
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className={cn(
                          "w-3.5 h-3.5 rounded-full flex-shrink-0",
                          workspace.color
                        )}
                      />
                      <span className="truncate text-sm">{workspace.name}</span>
                    </div>
                    {workspace.id === currentWorkspaceId && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>

            <CommandSeparator />

            {/* Create new workspace */}
            <div className="space-y-2">
              <div className="flex p-2 items-center gap-2 text-sm font-medium text-primary">
                <FolderPlus className="h-4 w-4" />
                Create Workspace
              </div>

              <Input
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="h-10 rounded-xs shadow-none"
              />

              {/* Color selector */}
              <div className="space-y-2">
                <label className="text-xs text-primary px-2 font-medium">
                  Label Color
                </label>
                <div className="flex flex-wrap gap-2 mt-2 px-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-5 h-5 rounded-full ring-1 ring-secondary transition-all hover:scale-110",
                        color.class,
                        selectedColor.name === color.name && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <CommandSeparator className="mt-3 mb-3"/>
              <Button
                variant="outline"
                onClick={handleCreate}
                disabled={!newWorkspaceName.trim() || isCreating}
                className="w-full rounded-xs text-muted-foreground hover:text-foreground hover:bg-foreground shadow-none flex justify-start"
                size="default"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-3 stroke-2" />
                    Create Workspace
                  </>
                )}
              </Button>
            </div>
            {workspaces.length >= 1 && (
              <>
                <div className="py-3">
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full rounded-xs flex justify-start text-muted-foreground hover:text-red-500 shadow-none bg-secondary"
                    onClick={handleDelete}
                    disabled={isDeleting || workspaces.length === 1}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash className="h-4 w-4 mr-3" />
                        Delete Workspace
                      </>
                    )}
                  </Button>
                  {workspaces.length === 1 && (
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      You need at least one workspace.
                    </p>
                  )}
                </div>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

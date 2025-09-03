"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";
import { useState } from "react";
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

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWorkspaceModal({ open, onOpenChange }: CreateWorkspaceModalProps) {
  const { createWorkspace } = useWorkspace();
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].class);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    
    setIsCreating(true);
    try {
      await createWorkspace(newWorkspaceName.trim(), selectedColor);
      setNewWorkspaceName("");
      setSelectedColor(colorOptions[0].class);
      onOpenChange?.(false);
    } catch (error) {
      console.error("Failed to create workspace:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Create Your First Workspace
          </DialogTitle>
          <DialogDescription>
            Get started by creating a workspace to organize your writing projects.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="e.g., My Writing Projects"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleCreateWorkspace()}
              disabled={isCreating}
            />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Choose a color:</p>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.class}
                  disabled={isCreating}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all duration-200 disabled:opacity-50",
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
          <Button 
            onClick={handleCreateWorkspace} 
            disabled={!newWorkspaceName.trim() || isCreating}
            className="w-full"
          >
            {isCreating ? "Creating..." : "Create Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
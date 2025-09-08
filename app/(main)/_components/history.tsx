"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Calendar, 
  Clock, 
  Search, 
  Trash2, 
  Copy, 
  Download,
  Plus,
  Eye,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { useWorkspace, Page } from "@/store/useWorkspace";

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDialog({ open, onOpenChange }: HistoryDialogProps) {
  const { 
    workspaces, 
    currentWorkspaceId, 
    createPage,
    setCurrentPage,
    deletePage,
    duplicatePage,
    exportPage,
  } = useWorkspace();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated");

  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);
  const pages = currentWorkspace?.pages || [];

  const filteredAndSortedPages = useMemo(() => {
    let filtered = pages.filter(page => 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return b.updatedAt - a.updatedAt;
        case "created":
          return b.createdAt - a.createdAt;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [pages, searchTerm, sortBy]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.max(1, Math.floor(diffInHours * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handlePageSelect = (page: Page) => {
    setCurrentPage(page.id);
    onOpenChange(false);
  };

  const handleNewPage = async () => {
    const pageId = await createPage();
    if (pageId) {
      onOpenChange(false);
    }
  };

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      await deletePage(pageId);
    }
  };

  const handleDuplicatePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicatePage(pageId);
  };

  const handleExportPage = (pageId: string, format: 'txt' | 'html' | 'md', e: React.MouseEvent) => {
    e.stopPropagation();
    exportPage(pageId, format);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "updated": return "Last Updated";
      case "created": return "Date Created";
      case "title": return "Title";
      default: return "Sort";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 flex-shrink-0" />
            Page History
          </DialogTitle>
          <DialogDescription className="text-sm">
            View and manage all your pages in {currentWorkspace?.name || "this workspace"}.
          </DialogDescription>

          {/* Search + Controls */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 sm:min-w-[140px] justify-between"
                >
                  <span className="truncate">{getSortLabel()}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setSortBy("updated")}>
                  <Clock className="w-4 h-4 mr-2" />
                  Last Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("created")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("title")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Title
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* New Page Button */}
            <Button
              onClick={handleNewPage}
              className="h-10 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Page
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Pages List */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            {filteredAndSortedPages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm ? "No pages match your search." : "No pages yet. Create your first page."}
              </div>
            ) : (
              filteredAndSortedPages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => handlePageSelect(page)}
                  className="group p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors border border-transparent hover:border-border"
                >
                  <div className="flex justify-between items-start gap-3">
                    {/* Page info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {page.title || "Untitled"}
                      </h3>
                      {page.content && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {page.content.replace(/\n/g, " ").trim().slice(0, 120)}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(page.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(page.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageSelect(page);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => handleDuplicatePage(page.id, e)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => handleExportPage(page.id, 'txt', e)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export as TXT
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleExportPage(page.id, 'md', e)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export as Markdown
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleExportPage(page.id, 'html', e)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export as HTML
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => handleDeletePage(page.id, e)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {pages.length > 0 && (
          <div className="px-4 py-2 border-t text-xs text-muted-foreground flex justify-between">
            <span>{filteredAndSortedPages.length} of {pages.length} pages</span>
            <span>{pages.reduce((sum, p) => sum + p.wordCount, 0).toLocaleString()} words total</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

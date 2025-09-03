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
import { Badge } from "@/components/ui/badge";
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
      const minutes = Math.floor(diffInHours * 60);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Page History
          </DialogTitle>
          <DialogDescription>
            View and manage all your pages in {currentWorkspace?.name || "this workspace"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Search and Controls */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sort: {sortBy === "updated" ? "Last Updated" : sortBy === "created" ? "Date Created" : "Title"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
            <Button onClick={handleNewPage} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </div>

          {/* Pages List */}
          <ScrollArea className="flex-1 border rounded-lg">
            {filteredAndSortedPages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm ? (
                  <div className="space-y-2">
                    <Search className="w-8 h-8 mx-auto opacity-50" />
                    <p>No pages found matching "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 mx-auto opacity-50" />
                    <p>No pages in this workspace yet</p>
                    <Button onClick={handleNewPage} variant="outline" size="sm">
                      Create your first page
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredAndSortedPages.map((page) => (
                  <div
                    key={page.id}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handlePageSelect(page)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="gap-2">
                        <h3 className="font-medium text-sm truncate">{page.title}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {page.wordCount} words
                          </Badge>
                          {page.charCount > 0 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {page.charCount} chars
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {page.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {page.content.substring(0, 100)}
                          {page.content.length > 100 && "..."}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {formatDate(page.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {formatDate(page.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleDuplicatePage(page.id, e)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => handleExportPage(page.id, 'txt', e)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export as TXT
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleExportPage(page.id, 'html', e)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export as HTML
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleExportPage(page.id, 'md', e)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export as Markdown
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => handleDeletePage(page.id, e)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer Stats */}
          {pages.length > 0 && (
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
              <span>
                {filteredAndSortedPages.length} of {pages.length} pages
              </span>
              <span>
                Total: {pages.reduce((sum, p) => sum + p.wordCount, 0)} words
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
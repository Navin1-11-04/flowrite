"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/store/useWorkspace";
import { Ellipsis, History, Download, HelpCircle, FileText, ChevronRight } from "lucide-react";
import { RefObject, useState } from "react";
import { HistoryDialog } from "./history";

type MenuProps = {
  pulse: (id: string) => void;
  iconRefs: RefObject<Record<string, SVGSVGElement | null>>;
};

export const Menu = ({ pulse, iconRefs }: MenuProps) => {
  const { currentPage, exportPage } = useWorkspace();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleExport = (format: 'txt' | 'html' | 'md') => {
    if (currentPage) {
      exportPage(currentPage.id, format);
      pulse("export");
    }
  };

  const handleHistoryClick = () => {
    setIsHistoryOpen(true);
    pulse("history");
  };

  const handleHelpClick = () => {
    pulse("help");
    // You can add help functionality here
    // For example, open a help modal or redirect to documentation
    alert("Help & Support coming soon!");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => pulse("ellipsis")}
            className="shadow-none rounded-full max-h-7"
          >
            <Ellipsis
              ref={(el) => {
                if (iconRefs.current) {
                  iconRefs.current["ellipsis"] = el;
                }
              }}
              className="w-5 h-5"
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          className="w-48 shadow-none" 
          side="bottom" 
          align="end"
          sideOffset={10} 
          alignOffset={0}
        >
          <DropdownMenuItem
            onClick={handleHistoryClick}
            className="flex items-center gap-2 cursor-pointer my-1 text-muted-foreground hover:text-foreground"
          >
            <History className="w-4 h-4 text-inherit" /> 
            Pages & History
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer my-1 text-muted-foreground hover:text-foreground">
              <Download className="w-4 h-4 text-inherit" />
              Export Current Page
              <ChevronRight className="w-3 h-3 ml-auto" />
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => handleExport('txt')}
                disabled={!currentPage}
                className="flex items-center gap-2 cursor-pointer my-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                Text File (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('html')}
                disabled={!currentPage}
                className="flex items-center gap-2 cursor-pointer my-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                HTML File (.html)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('md')}
                disabled={!currentPage}
                className="flex items-center gap-2 cursor-pointer my-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
                Markdown (.md)
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleHelpClick}
            className="flex items-center gap-2 cursor-pointer my-1 text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="w-4 h-4 text-inherit" /> 
            Help & Support
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <HistoryDialog 
        open={isHistoryOpen} 
        onOpenChange={setIsHistoryOpen} 
      />
    </>
  );
};
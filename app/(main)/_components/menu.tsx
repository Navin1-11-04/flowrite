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
import { Ellipsis, History, Download, HelpCircle, FileText, ChevronRight, EllipsisVertical } from "lucide-react";
import { RefObject, useState } from "react";
import { HistoryDialog } from "./history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  };

  const handleHelpClick = () => {
    alert("Help & Support coming soon!");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => pulse("ellipsis")}
            className="shadow-none rounded-sm"
          >
            <EllipsisVertical
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
  className="w-64 shadow-none px-2" 
  side="bottom" 
  align="end"
  sideOffset={10} 
  alignOffset={0}
>
  <h2 className="px-2 font-medium text-muted-foreground text-sm flex items-center py-1">
    Menu
  </h2>

  <DropdownMenuItem
    onClick={handleHistoryClick}
    className="flex items-center gap-3 cursor-pointer my-1.5 text-primary hover:text-foreground hover:bg-secondary rounded-xs"
  >
    <History className="w-4 h-4" /> 
    History
  </DropdownMenuItem>

  {/* Export Section */}
  <div className="px-2 pt-2">
  <h3 className="text-xs font-medium text-muted-foreground mb-2">Export Page</h3>
  <div className="flex gap-2">
    <Select onValueChange={(val: 'txt' | 'html' | 'md') => handleExport(val)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose format" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="txt">Text File (.txt)</SelectItem>
        <SelectItem value="html">HTML File (.html)</SelectItem>
        <SelectItem value="md">Markdown (.md)</SelectItem>
      </SelectContent>
    </Select>
    <Button 
      onClick={() => handleExport('txt')} 
      className="flex-shrink-0"
      disabled={!currentPage}
    >
      Export
    </Button>
  </div>
</div>

  <DropdownMenuSeparator className="my-2"/>

  <DropdownMenuItem
    onClick={handleHelpClick}
    className="flex items-center gap-3 cursor-pointer my-1.5 text-primary hover:text-foreground hover:bg-secondary rounded-xs"
  >
    <HelpCircle className="w-4 h-4" /> 
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
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, Share2, History, Download, HelpCircle } from "lucide-react";
import { RefObject } from "react";

type MenuProps = {
  pulse: (id: string) => void;
  iconRefs: RefObject<Record<string, SVGSVGElement | null>>;
};

export const Menu = ({ pulse, iconRefs }: MenuProps) => {
  return (
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
              iconRefs.current["ellipsis"] = el;
            }}
            className="w-5 h-5"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40 shadow-none" side="bottom" align="end"
      sideOffset={10} alignOffset={0}>
        <DropdownMenuItem
          onClick={() => pulse("share")}
          className="flex items-center gap-2 cursor-pointer my-1 text-muted-foreground hover:text-foreground"
        >
          <Share2 className="w-4 h-4 text-inherit" /> Share
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => pulse("history")}
          className="flex items-center gap-2 cursor-pointer my-1
          text-muted-foreground hover:text-foreground"
        >
          <History className="w-4 h-4 text-inherit" /> History
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => pulse("export")}
          className="flex items-center gap-2 cursor-pointer my-1
          text-muted-foreground hover:text-foreground"
        >
          <Download className="w-4 h-4 text-inherit" /> Export
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => pulse("help")}
          className="flex items-center gap-2 cursor-pointer my-1 text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="w-4 h-4 text-inherit" /> Help
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

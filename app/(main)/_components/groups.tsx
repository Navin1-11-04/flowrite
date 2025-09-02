import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Plus, Trash } from "lucide-react";

export function Groups() {
  const groups = ["Design", "Life", "Travel"];
  const current = "Workspace";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center bg-background outline-none">
        <span className="w-4.5 h-4.5 mr-2.5 rounded-full bg-red-300" />
        <div className="flex items-center text-foreground">
          <h1 className="text-sm truncate max-w-25 font-[450]">{current}</h1>
          <ChevronsUpDown className="ml-3 size-3.5 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-40"
        side="bottom"
        align="start"
        sideOffset={10}
        alignOffset={-12}
      >
        {groups.map((group) => (
          <DropdownMenuItem
            key={group}
            className={cn(
              "flex items-center gap-2.5 my-1 text-muted-foreground",
              group === current && "text-foreground font-[450]"
            )}
          >
            <span className="w-4 h-4 rounded-full bg-orange-300" />
            <p className="text-sm  truncate ">{group}</p>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center text-muted-foreground focus:text-foreground transition-all duration-300 my-1">
          <Plus className="size-4 mr-1 text-inherit" strokeWidth={2.5} />
          <p className="text-sm ">New Group</p>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center text-muted-foreground focus:text-red-500 transition-all duration-300 my-1">
          <Trash className="size-4 mr-1 text-inherit" strokeWidth={2.3} />
          <p className="text-sm ">Delete Group</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/useUserStore";
import { AvatarIcon, GearIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";


export const Header = () => {
    const { user, isLoading, isAuthenticated } = useUserStore();

    return (
       <div className="w-full px-4 font-poppins">
        <div className="w-full h-10 flex items-center justify-between">
         <h1>
            Flo
         </h1>
        {!isLoading && isAuthenticated && user && (
            <div className="hidden text-sm sm:flex items-center gap-x-2"><AvatarIcon className="w-4 h-4"/>{user.name?.split(" ")[0]}</div> 
        )}
       </div>
       <div className="w-full h-10 flex items-center justify-between">
         <p>Search bar</p>
         <div className="w-auto flex items-center gap-x-2">
            <Button
             type="button"
             variant="ghost"
             className="w-8 h-8 rounded-full"
            >
            <GearIcon/>
            </Button>
            <Button
             type="button"
             variant="ghost"
             className="w-8 h-8 rounded-full"
            >
            <QuestionMarkCircledIcon/>
            </Button>
         </div>
       </div>
        </div>
    );
}
 

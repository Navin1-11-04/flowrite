"use client";

import { Spinner } from "@/components/ui/spinner";
import { useUserStore } from "@/store/useUserStore";
import { redirect } from "next/navigation";


const LandingLayout = ({children} : 
    {
    children : React.ReactNode
    }) => {
       
    const { user, loading } = useUserStore();
      
    if(loading){
        return (
          <div className="h-full flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )
    }
    
    return (
        <div className="h-full w-full">
            {children}
        </div>
    );
}
 
export default LandingLayout;
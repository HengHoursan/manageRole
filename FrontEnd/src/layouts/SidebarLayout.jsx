import AppSidebar from "../layouts/AppSidebar";
import {Separator} from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {Outlet} from "react-router-dom";

export default function SidebarLayout() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                {/* Header */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                </header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col gap-4 p-4 w-full">
                    <Outlet/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}

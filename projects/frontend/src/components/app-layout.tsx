import AppSidebar from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export default function AppLayout ({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="p-4 w-full">
        <SidebarTrigger />
        <div className='py-3'>
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}

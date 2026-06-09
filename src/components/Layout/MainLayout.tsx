import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { ModalRegistry } from "./ModalRegistry";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-20 md:pb-6">
          <div className="w-full mx-auto px-2">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <ModalRegistry />
    </div>
  );
}

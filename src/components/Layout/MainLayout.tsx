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
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-1 min-w-0">
          <div className="w-full h-full min-h-0 mx-auto p-3 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <ModalRegistry />
    </div>
  );
}

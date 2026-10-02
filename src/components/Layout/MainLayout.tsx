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
            {/* main's pb-20 isn't reliably applied past this h-full child's overflow,
                so the fixed bottom nav would sit over the last element on mobile. */}
            <div aria-hidden className="h-16 md:hidden" />
          </div>
        </main>
      </div>
      <MobileNav />
      <ModalRegistry />
    </div>
  );
}

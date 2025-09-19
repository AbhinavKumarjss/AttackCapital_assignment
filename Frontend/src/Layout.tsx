import { Outlet} from "react-router-dom";
import SideBar from "./components/Sidebar";

import Navbar from "./components/Navbar";

export default function Layout() {

    return (
        <div className="overflow-hidden h-screen w-full">
            <Navbar />
            <div className="flex h-full w-full">
                <SideBar />

                <Outlet />
            </div>



        </div>
    );
}
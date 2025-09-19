import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu,  PhoneCall, Bot } from "lucide-react";

export default function SideBar() {
  const [SidebarOpen, SetSidebarOpen] = useState<boolean>(false);

  return (
    <div className="w-[52px] relative">
      <div
        className={`${
          SidebarOpen ? "w-[200px]" : "w-[52px]"
        } bg-[#0f1117] border-r border-gray-800 z-10 absolute p-2 gap-1 h-full flex flex-col transition-all duration-200`}
      >

        <div onClick={() => SetSidebarOpen(!SidebarOpen)} className="flex cursor-pointer p-2 rounded text-gray-400 hover:text-emerald-400 transition-all duration-200">
          <div id="link-logo" >
            <Menu size={20} />
          </div>
        </div>

        <hr className="border-gray-800 my-2" />


        <div className="flex flex-col">
          <Link
            to="/calls"
            className="flex p-2 items-center cursor-pointer text-gray-400 hover:bg-[#1c1e26] hover:text-white rounded transition-all duration-200"
          >
            <div id="link-logo">
              <PhoneCall size={20} />
            </div>
            <div
              id="link-text"
              className={`${
                SidebarOpen ? "max-w-[200px] pl-2" : "max-w-0 pl-0"
              } flex items-center overflow-hidden transition-all duration-200 ease-in-out whitespace-nowrap`}
            >
              Calls
            </div>
          </Link>
        </div>


        <div className="flex flex-col">
          <Link
            to="/bots"
            className="flex p-2 items-center cursor-pointer text-gray-400 hover:bg-[#1c1e26] hover:text-white rounded transition-all duration-200"
          >
            <div id="link-logo">
              <Bot size={20} />
            </div>
            <div
              id="link-text"
              className={`${
                SidebarOpen ? "max-w-[200px] pl-2" : "max-w-0 pl-0"
              } flex items-center overflow-hidden transition-all duration-200 ease-in-out whitespace-nowrap`}
            >
              Bots
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

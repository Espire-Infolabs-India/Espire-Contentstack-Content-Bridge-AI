import Link from "next/link";
import React, { useState, useEffect } from "react";
import { HeaderEntryResponse } from "../typescript/header";
import Settings from "./Settings";


 
const Navigation: React.FC<HeaderEntryResponse> = (
  entry: HeaderEntryResponse
) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
   const [aiModel, setAIModel] = useState<string>("gemini-2.0-flash");

  const getAIModel = (e: React.SyntheticEvent) => {
      setAIModel((e.target as HTMLInputElement).value);
  };


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuToggle = (menuName: string) => {
    if (isMobile) {
      setActiveMenu(activeMenu === menuName ? null : menuName);
    }
  };

  const handleMouseEnter = (menuName: string) => {
    if (!isMobile) {
      setActiveMenu(menuName);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveMenu(null);
    }
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex justify-between w-full items-center">
            <h1 className="flex items-center">
              Espire CMS Copilate
             
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-4"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10 1.5625C5.34025 1.5625 1.5625 5.34025 1.5625 10C1.5625 14.6597 5.34025 18.4375 10 18.4375C14.6597 18.4375 18.4375 14.6597 18.4375 10C18.4375 5.34025 14.6597 1.5625 10 1.5625ZM0.4375 10C0.4375 4.7185 4.7185 0.4375 10 0.4375C15.2815 0.4375 19.5625 4.7185 19.5625 10C19.5625 15.2815 15.2815 19.5625 10 19.5625C4.7185 19.5625 0.4375 15.2815 0.4375 10Z"
                    fill="#6E6B86"
                  />
                  <path
                    d="M10 15.8125C10.2486 15.8125 10.4871 15.7137 10.6629 15.5379C10.8387 15.3621 10.9375 15.1236 10.9375 14.875C10.9375 14.6264 10.8387 14.3879 10.6629 14.2121C10.4871 14.0363 10.2486 13.9375 10 13.9375C9.75136 13.9375 9.5129 14.0363 9.33709 14.2121C9.16127 14.3879 9.0625 14.6264 9.0625 14.875C9.0625 15.1236 9.16127 15.3621 9.33709 15.5379C9.5129 15.7137 9.75136 15.8125 10 15.8125Z"
                    fill="#6E6B86"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8.7805 5.1805C9.19392 5.00933 9.63875 4.92712 10.086 4.93922C10.5333 4.95131 10.9731 5.05745 11.3766 5.25071C11.7802 5.44398 12.1385 5.72005 12.4284 6.06095C12.7182 6.40186 12.933 6.79997 13.0588 7.22937C13.1846 7.65878 13.2186 8.10986 13.1585 8.55326C13.0985 8.99667 12.9458 9.42247 12.7103 9.80295C12.4748 10.1834 12.1619 10.5101 11.7918 10.7616C11.4218 11.0132 11.0029 11.184 10.5625 11.263V11.5C10.5625 11.6492 10.5032 11.7923 10.3977 11.8977C10.2923 12.0032 10.1492 12.0625 10 12.0625C9.85082 12.0625 9.70774 12.0032 9.60225 11.8977C9.49676 11.7923 9.4375 11.6492 9.4375 11.5V10.75C9.4375 10.6008 9.49676 10.4577 9.60225 10.3523C9.70774 10.2468 9.85082 10.1875 10 10.1875C10.4079 10.1875 10.8067 10.0665 11.1459 9.83991C11.485 9.61328 11.7494 9.29116 11.9055 8.91428C12.0616 8.53741 12.1025 8.12271 12.0229 7.72263C11.9433 7.32254 11.7469 6.95504 11.4584 6.66659C11.17 6.37815 10.8025 6.18171 10.4024 6.10213C10.0023 6.02255 9.58759 6.06339 9.21072 6.2195C8.83384 6.3756 8.51172 6.63996 8.28509 6.97914C8.05846 7.31831 7.9375 7.71708 7.9375 8.125C7.9375 8.27418 7.87824 8.41726 7.77275 8.52275C7.66726 8.62824 7.52418 8.6875 7.375 8.6875C7.22582 8.6875 7.08274 8.62824 6.97725 8.52275C6.87176 8.41726 6.8125 8.27418 6.8125 8.125C6.8126 7.4946 6.99962 6.87838 7.34992 6.35427C7.70022 5.83016 8.19806 5.42168 8.7805 5.1805Z"
                    fill="#6E6B86"
                  />
                </svg>
            </h1>
            {/* <Settings model={aiModel} setAIModel={getAIModel} />  */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;

// "use client";

// import React, { useEffect, useState } from "react";
// import { ChevronLeftIcon } from "lucide-react";
// import { Asset } from "./AssetPicker";

// interface Item {
//   uid: string;
//   name?: string;
//   filename?: string;
//   is_dir: boolean;
//   parent_uid: string | null;
//   url?: string;
//   title?: string;
//   [key: string]: any;
// }

// const FolderTree = ({
//   data,
//   onSelectAsset,
//   isUploadNew,
// }: {
//   data: Asset[];
//   onSelectAsset: (asset: Asset) => void;
//   isUploadNew?: boolean;
// }) => {
//   const [currentParentUid, setCurrentParentUid] = useState<string | null>(null);
//   const [currentItems, setCurrentItems] = useState<Item[]>([]);
//   const [history, setHistory] = useState<string[]>([]);

//   useEffect(() => {
//     const filtered = data.filter(
//       (item) => item.parent_uid === currentParentUid
//     );
//     setCurrentItems(filtered);
//   }, [currentParentUid, data]);

//   const goToFolder = (uid: string) => {
//     setHistory((prev) => [...prev, currentParentUid || "root"]);
//     setCurrentParentUid(uid);
//   };

//   const goBack = () => {
//     const prev = [...history];
//     const last = prev.pop();
//     setHistory(prev);
//     setCurrentParentUid(last === "root" ? null : last || null);
//   };

//   return (
//     <div className="relative h-full">

//       <div className="p-4 overflow-auto h-full pb-24">
//         {currentParentUid && (
//           <button
//             className="mb-4 flex items-center text-blue-600 font-semibold"
//             onClick={goBack}
//           >
//             <ChevronLeftIcon className="mr-2" /> Back
//           </button>
//         )}

//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
//           {isUploadNew && (
//             <div className="flex flex-col items-center border rounded-lg p-4 cursor-pointer hover:border-blue-600 bg-white shadow hover:shadow-lg transition-all duration-300">
//               <div className="w-24 h-24 flex items-center justify-center mb-2">
//                 <img
//                   src={"/icon/add-folder.png"}
//                   alt="Open folder"
//                   className="w-full h-full object-contain rounded"
//                 />
//               </div>
//               <p className="text-center text-sm font-medium truncate w-24">
//                 New Folder
//               </p>
//             </div>
//           )}

//           {currentItems.map((item) => (
//             <div
//               key={item.uid}
//               className="flex flex-col items-center border rounded-lg p-4 cursor-pointer hover:border-blue-600 bg-white shadow hover:shadow-lg transition-all duration-300"
//               onClick={() => {
//                 if (item.is_dir) {
//                   goToFolder(item.uid);
//                 } else {
//                   onSelectAsset(item);
//                 }
//               }}
//             >
//               <div className="w-24 h-24 flex items-center justify-center mb-2">
//                 <img
//                   src={
//                     item.is_dir
//                       ? "/icon/open-folder.png"
//                       : item.url || "/icon/file-placeholder.png"
//                   }
//                   alt={item.name || item.title}
//                   className="w-full h-full object-contain rounded"
//                 />
//               </div>
//               <p className="text-center text-sm font-medium truncate w-24">
//                 {item.name || item.title || item.filename}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {isUploadNew && (
//         <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t flex justify-end">
//           <label
//             htmlFor="choose-asset"
//             className="btn bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
//           >
//             Choose file
//           </label>
//           <input type="file" id="choose-asset" className="hidden" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default FolderTree;

"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeftIcon, X, Check } from "lucide-react";
import { Asset } from "./AssetPicker";
import axios from "axios";
// import { fetchFolders } from "./FetchFolders";

interface Item {
  uid: string;
  name?: string;
  filename?: string;
  is_dir: boolean;
  parent_uid: string | null;
  url?: string;
  title?: string;
  [key: string]: any;
}

const FolderTree = ({
  data,
  onSelectAsset,
  isUploadNew,
}: {
  data: Asset[];
  onSelectAsset: (asset: Asset) => void;
  isUploadNew?: boolean;
}) => {
  const [currentParentUid, setCurrentParentUid] = useState<string | null>(null);
  const [currentItems, setCurrentItems] = useState<Item[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
   const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const filtered = data.filter(
      (item) => item.parent_uid === currentParentUid
    );
    setCurrentItems(filtered);
  }, [currentParentUid, data]);

  const goToFolder = (uid: string) => {
    setHistory((prev) => [...prev, currentParentUid || "root"]);
    console.log("Current Parent UID:", currentParentUid);
    console.log("Navigating to folder UID:", uid);
    setCurrentParentUid(uid);
    console.log("Updated Parent UID:", uid);
  };

  const goBack = () => {
    const prev = [...history];
    const last = prev.pop();
    setHistory(prev);
    setCurrentParentUid(last === "root" ? null : last || null);
  };

  const createFolder = async (folderName: string) => {
    const res = await axios.post(
      "/api/create-folder",
      {
        asset: {
          name: folderName,
        },
      },
      {
        headers: {
          api_key: "blta0ff3cef332c7e34",
          authorization: "cs12d75480f66ef53252922e8f",
        },
      }
    );
    // fetchFolders();
    alert("Folder Created");
  };


  const uploadAsset = async (parent_uid: string) => {
    console.log("Uploading asset to parent UID:", parent_uid);
    if (!file) return;
    const formData = new FormData();
    formData.append("asset[upload]", file);
    formData.append("asset[title]", file.name);
    formData.append("asset[parent_uid]", parent_uid);

    const res1 = await fetch("https://api.contentstack.io/v3/assets", {
      method: "POST",
      headers: {
        api_key: "blta0ff3cef332c7e34",
        authorization: "cs12d75480f66ef53252922e8f",
      },
      body: formData,
    });

    const data = await res1.json();
    console.log("✅ Upload Successful", data);

    // fetchAssets();
    setFile(null);
    alert("Uploaded Successfully");
  };





  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName);
    // setCurrentItems((prev) => [newFolder, ...prev]);
    setNewFolderName("");
    setIsAddingFolder(false);
  };

  const handleCancelCreate = () => {
    setNewFolderName("");
    setIsAddingFolder(false);
  };

  return (
    <div className="relative h-full">
      <div className="p-4 overflow-auto h-full pb-24">
        {currentParentUid && (
          <button
            className="mb-4 flex items-center text-blue-600 font-semibold"
            onClick={goBack}
          >
            <ChevronLeftIcon className="mr-2" /> Back
          </button>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
      
          {isUploadNew &&
            (isAddingFolder ? (
              <div className="flex flex-col items-center border rounded-lg p-4 bg-white shadow min-h-[160px] justify-between">
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="border px-2 py-1 rounded text-sm w-full text-center"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleCancelCreate}>
                    <X className="w-5 h-5 text-purple-500 hover:text-purple-700" />
                  </button>
                  <button onClick={handleCreateFolder}>
                    <Check className="w-5 h-5 text-purple-500 hover:text-purple-700" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col items-center border rounded-lg p-4 cursor-pointer hover:border-blue-600 bg-white shadow hover:shadow-lg transition-all duration-300"
                onClick={() => setIsAddingFolder(true)}
              >
                <div className="w-24 h-24 flex items-center justify-center mb-2">
                  <img
                    src={"/icon/add-folder.png"}
                    alt="Open folder"
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <p className="text-center text-sm font-medium truncate w-24">
                  New Folder
                </p>
              </div>
            ))}

          {/* Folder & File Items */}
          {currentItems.map((item) => (
            <div
              key={item.uid}
              className="flex flex-col items-center border rounded-lg p-4 cursor-pointer hover:border-blue-600 bg-white shadow hover:shadow-lg transition-all duration-300"
              onClick={() => {
                if (item.is_dir) {
                  goToFolder(item.uid);
                } else {
                  onSelectAsset(item);
                }
              }}
            >
              <div className="w-24 h-24 flex items-center justify-center mb-2">
                <img
                  src={
                    item.is_dir
                      ? "/icon/open-folder.png"
                      : item.url || "/icon/file-placeholder.png"
                  }
                  alt={item.name || item.title}
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <p className="text-center text-sm font-medium truncate w-24">
                {item.name || item.title || item.filename}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isUploadNew && (
        <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t flex justify-end">
          <label
            htmlFor="choose-asset"
            className="btn bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Choose file
          </label>
          <input type="file" id="choose-asset" className="hidden"  onChange={(e) =>{ 
            setFile(e.target.files?.[0] || null)
            uploadAsset("bltf3cf6b0f8463f090");
            
            }}/>
        </div>
      )}
    </div>
  );
};

export default FolderTree;

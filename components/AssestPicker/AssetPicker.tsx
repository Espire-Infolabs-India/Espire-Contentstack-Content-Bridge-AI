"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import FolderTree from "./FolderTree";

export interface Asset {
  uid: string;
  name?: string;
  filename?: string;
  is_dir: boolean;
  parent_uid: string | null;
  url?: string;
  title?: string;
  [key: string]: any;
}

interface Folder {
  uid: string;
  name: string;
}

const AssetPicker = () => {
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploadNew, setIsUploadNew] = useState<boolean | undefined>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const fetchAssets = async () => {
    const res = await axios.get("/api/fetch-assets", {
      headers: {
        api_key: process.env.API_KEY as string,
        authorization: process.env.AUTHORIZATION as string,
      },
    });
    setAssets(res.data.assets);
  };

  const fetchFolders = async () => {
    const res = await axios.get("/api/fetch-folders", {
      headers: {
        api_key: process.env.API_KEY as string,
        authorization: process.env.AUTHORIZATION as string,
      },
    });
    const folders = res.data.assets.filter(
      (folder: { name: string }) => folder?.name
    );
    setFolders(folders);
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
        api_key: process.env.API_KEY as string,
        authorization: process.env.AUTHORIZATION as string,
      },
      body: formData,
    });

    const data = await res1.json();
    console.log("✅ Upload Successful", data);

    fetchAssets();
    setFile(null);
    alert("Uploaded Successfully");
  };

  useEffect(() => {
    if (showModal) {
      fetchAssets();
      fetchFolders();
    }
  }, [showModal]);

  return (
    <div className="p-4">
      {selectedAsset && (
        <div className="mt-4 flex items-center gap-4">
          <img
            src={selectedAsset.url}
            alt="Selected Asset"
            className="w-24 h-24 object-cover rounded"
          />
          <span className="text-lg font-medium">{selectedAsset.title}</span>
        </div>
      )}

      <div className="mb-6">
        <button
        type="button"
          className="choose-a-file-btn bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Choose from existing assets
        </button>

        <p className="mt-2 text-center">or</p>

        <button
        type="button"
          className="choose-a-file-btn bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => {
            setShowModal(true);
            setIsUploadNew(true);
          }}
        >
          Upload a new file
        </button>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-3/4 h-full overflow-auto  relative">
              <button
              type="button"
                className="absolute top-2 right-2 text-red-500 font-bold text-xl"
                onClick={() => {
                  setShowModal(false);
                  setIsUploadNew(false);
                }}
              >
                &times;
              </button>

              {isUploadNew ? (
                <>
                  <h3 className="font-bold text-lg mb-4">Upload Assets</h3>
                  <FolderTree
                    data={folders as Asset[]}
                    onSelectAsset={(asset: Asset) => {
                      setSelectedAsset(asset);
                      setShowModal(false);
                    }}
                    isUploadNew={isUploadNew}
                  />
                </>
              ) : (
                <>
                  <h3 className="font-bold text-lg mb-4">Select Assets</h3>

                  <FolderTree
                    data={assets}
                    onSelectAsset={(asset: Asset) => {
                      setSelectedAsset(asset);
                      setShowModal(false);
                    }}
                    isUploadNew={isUploadNew}
                  />
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssetPicker;



// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import FolderTree from "./FolderTree";

// export interface Asset {
//   uid: string;
//   name?: string;
//   filename?: string;
//   is_dir: boolean;
//   parent_uid: string | null;
//   url?: string;
//   title?: string;
//   [key: string]: any;
// }

// interface Folder {
//   uid: string;
//   name: string;
// }

// interface AssetPickerProps {
//   onAssetSelect: (asset: Asset) => void;
// }

// const AssetPicker: React.FC<AssetPickerProps> = ({ onAssetSelect }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [assets, setAssets] = useState<Asset[]>([]);
//   const [folders, setFolders] = useState<Folder[]>([]);
//   const [file, setFile] = useState<File | null>(null);
//   const [isUploadNew, setIsUploadNew] = useState<boolean>(false);
//   const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

//   const fetchAssets = async () => {
//     const res = await axios.get("/api/fetch-assets", {
//       headers: {
//         api_key: process.env.API_KEY as string,
//         authorization: process.env.AUTHORIZATION as string,
//       },
//     });
//     setAssets(res.data.assets);
//   };

//   const fetchFolders = async () => {
//     const res = await axios.get("/api/fetch-folders", {
//       headers: {
//         api_key: process.env.API_KEY as string,
//         authorization: process.env.AUTHORIZATION as string,
//       },
//     });
//     const folders = res.data.assets.filter(
//       (folder: { name: string }) => folder?.name
//     );
//     setFolders(folders);
//   };

//   const uploadAsset = async (parent_uid: string) => {
//     if (!file) return;
//     const formData = new FormData();
//     formData.append("asset[upload]", file);
//     formData.append("asset[title]", file.name);
//     formData.append("asset[parent_uid]", parent_uid);

//     const res1 = await fetch("https://api.contentstack.io/v3/assets", {
//       method: "POST",
//       headers: {
//         api_key: process.env.API_KEY as string,
//         authorization: process.env.AUTHORIZATION as string,
//       },
//       body: formData,
//     });

//     const data = await res1.json();
//     console.log("✅ Upload Successful", data);
//     fetchAssets();
//     setFile(null);
//     alert("Uploaded Successfully");
//   };

//   useEffect(() => {
//     if (showModal) {
//       fetchAssets();
//       fetchFolders();
//     }
//   }, [showModal]);

//   const handleAssetSelect = (asset: Asset) => {
//     setSelectedAsset(asset);
//     setShowModal(false);
//     setIsUploadNew(false);
//     onAssetSelect(asset);
//   };

//   return (
//     <div className="mt-4">
//       {selectedAsset && (
//         <div className="mb-4 flex items-center gap-4">
//           <img
//             src={selectedAsset.url}
//             alt="Selected Asset"
//             className="w-24 h-24 object-cover rounded"
//           />
//           <span className="text-lg font-medium">{selectedAsset.title}</span>
//         </div>
//       )}

//       <div className="mb-6 flex flex-col items-center gap-2">
//         <button
//           type="button"
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//           onClick={() => {
//             setIsUploadNew(false);
//             setShowModal(true);
//           }}
//         >
//           Choose from existing assets
//         </button>

//         <p className="text-sm">or</p>

//         <button
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//           type="button"
//           onClick={() => {
//             setIsUploadNew(true);
//             setShowModal(true);
//           }}
//         >
//           Upload a new file
//         </button>
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-lg w-3/4 h-full overflow-auto relative">
//             <button
//               type="button"
//               className="absolute top-2 right-2 text-red-500 font-bold text-xl"
//               onClick={() => {
//                 setShowModal(false);
//                 setIsUploadNew(false);
//               }}
//             >
//               &times;
//             </button>

//             {isUploadNew ? (
//               <>
//                 <h3 className="font-bold text-lg mb-4">Upload Assets</h3>
//                 <FolderTree
//                   data={folders as Asset[]}
//                   onSelectAsset={handleAssetSelect}
//                   isUploadNew={true}
//                 />
//               </>
//             ) : (
//               <>
//                 <h3 className="font-bold text-lg mb-4">Select Assets</h3>
//                 <FolderTree
//                   data={assets}
//                   onSelectAsset={handleAssetSelect}
//                   isUploadNew={false}
//                 />
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AssetPicker;

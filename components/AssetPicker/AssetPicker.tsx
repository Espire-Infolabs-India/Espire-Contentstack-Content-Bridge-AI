"use client";
import React, { useEffect, useState } from "react";
import AssestPickerUpload from "./AssetPickerUpload";
import { fetchAssets, fetchFolders } from "../../helper/AssetPickerAPI";
import { Asset } from "./AssetPickerModel";
import { CircleMinus } from "lucide-react";
type Props = {
  setSelectedAssetData: (asset: Asset) => void;
  jwt: string;
};

const AssetPicker = ({ setSelectedAssetData, jwt }: Props) => {
  console.log("JWT in AssetPicker:", jwt);
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<Asset[]>([]);
  const [uploadMode, setUploadMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (showModal) {
      fetchAssets(jwt).then(setAssets);
      fetchFolders(jwt).then(setFolders);
    }
  }, [showModal]);

  const handleSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setSelectedAssetData(asset);
    setShowModal(false);
    setUploadMode(false);
  };
  return (
    <div className="p-4">
      {selectedAsset && (
        <div className="mt-4 flex items-center gap-4">
          <img
            src={selectedAsset.url}
            alt="Selected Asset"
            className="w-50 h-50 object-cover rounded"
          />
          <button onClick={() => setSelectedAsset(null)}>
            {" "}
            <CircleMinus />
          </button>
        </div>
      )}

      <div className="flex items-center space-x-2 text-sm mb-4">
        <button
          className="text-blue-600 underline hover:text-blue-800"
          onClick={() => setShowModal(true)}
          type="button"
        >
          Choose a file
        </button>

        <span className="text-gray-500">or</span>

        <button
          type="button"
          className="text-blue-600 underline hover:text-blue-800 flex items-center"
          onClick={() => {
            setShowModal(true);
            setUploadMode(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 12l-4-4m0 0l-4 4m4-4v12"
            />
          </svg>
          Upload a new file
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/4 h-full overflow-auto relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-red-500 font-bold text-xl"
              onClick={() => {
                setShowModal(false);
                setUploadMode(false);
              }}
            >
              &times;
            </button>
            <h3 className="font-bold text-lg mb-4">
              {uploadMode ? "Upload Assets" : "Select Assets"}
            </h3>
            <AssestPickerUpload
              data={uploadMode ? folders : assets}
              isUploadNew={uploadMode}
              onSelectAsset={handleSelect}
              setSelectedAssetData={setSelectedAssetData}
              setSelectedAsset={setSelectedAsset}
              jwt={jwt}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetPicker;

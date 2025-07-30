// components/FolderTree.tsx
"use client";
import React, { useEffect, useState, useRef } from "react";
import { ChevronLeftIcon, X, Check, UploadCloud } from "lucide-react";
import {
  uploadAsset,
  fetchAssets,
  createFolder,
} from "../../helper/AssestPickerAPI";
import { Asset } from "./AssestPickerModel";

type Props = {
  data: Asset[];
  onSelectAsset: (asset: Asset) => void;
  isUploadNew?: boolean;
  setSelectedAssetData: (asset: Asset) => void;
  setSelectedAsset: (asset: Asset | null) => void;
};

const FolderTree = ({
  data,
  onSelectAsset,
  isUploadNew,
  setSelectedAssetData,
  setSelectedAsset,
}: Props) => {
  const [currentParentUid, setCurrentParentUid] = useState<string | null>(null);
  const [currentItems, setCurrentItems] = useState<Asset[]>([]);
  const [history] = useState<string[]>([]);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const lastUploadedFileRef = useRef<string | null>(null);

  useEffect(() => {
    const filtered = data.filter(
      (item) => item.parent_uid === currentParentUid
    );
    setCurrentItems(filtered);
  }, [currentParentUid, data]);

  const handleUpload = async (file: File) => {
    if (!file || !currentParentUid || file.name === lastUploadedFileRef.current)
      return;
    setUploading(true);
    lastUploadedFileRef.current = file.name;
    const data = await uploadAsset(file, currentParentUid);
    // await fetchAssets();
    setSelectedAssetData(data);
    setSelectedAsset(data?.asset);

    setUploading(false);
  };

  return (
    <div className="relative h-full">
      <div className="p-4 overflow-auto h-full pb-24">
        {currentParentUid && (
          <button
            onClick={() => setCurrentParentUid(history.pop() || null)}
            className="mb-4 flex items-center text-blue-600"
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
                  <button
                    type="button"
                    onClick={() => setIsAddingFolder(false)}
                  >
                    <X />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      createFolder(newFolderName);
                      setIsAddingFolder(false);
                    }}
                  >
                    <Check />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsAddingFolder(true)}
                className="cursor-pointer border p-4 flex flex-col items-center shadow hover:shadow-lg"
              >
                <img
                  src="/icon/add-folder.png"
                  className="w-24 h-24 object-contain"
                  alt="Add Folder"
                />
                <p className="truncate w-24 text-sm mt-2 text-center">
                  New Folder
                </p>
              </div>
            ))}

          {currentItems.map((item) => (
            <div
              key={item.uid}
              onClick={() =>
                item.is_dir
                  ? setCurrentParentUid(item.uid)
                  : onSelectAsset(item)
              }
              className="cursor-pointer border p-4 flex flex-col items-center shadow hover:shadow-lg"
            >
              <img
                alt="Asset"
                src={
                  item.is_dir
                    ? "/icon/open-folder.png"
                    : item.url || "/icon/file-placeholder.png"
                }
                className="w-24 h-24 object-contain"
              />
              <p className="truncate w-24 text-sm mt-2 text-center">
                {item.name || item.title || item.filename}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isUploadNew && (
        <div className="absolute bottom-0 right-0 w-full p-4 bg-white border-t flex justify-end">
          <label
            htmlFor="choose-file"
            className="flex items-center gap-2 cursor-pointer text-blue-600"
          >
            <UploadCloud className="w-4 h-4" />
            {uploading ? "Uploading..." : "Choose a file"}
          </label>
          <input
            type="file"
            id="choose-file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FolderTree;

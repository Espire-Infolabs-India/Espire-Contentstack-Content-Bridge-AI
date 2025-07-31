"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import axios from "axios";
import Settings from "./Settings";
import AssetPicker from "./AssestPicker/AssetPicker";
import { Asset } from "./AssestPicker/AssestPickerModel";

interface FormField {
  name: string;
  value: string;
}

export default function HomePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);

  const [template, setTemplate] = useState<string>("author");
  const [url, setURL] = useState<string>("");
  const [errorAlert, setErrorAlert] = useState<string>("");

  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [referenceFields, setReferenceFields] = useState<any>(null);
  const [fileFieldList, setFileFieldList] = useState<any>(null);
  const [contentTypeResult, setContentTypeResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiModel, setAIModel] = useState<string>("custom_bot");

  const [firstPage, setFirstPage] = useState(true);
  const [secondPage, setSecondPage] = useState(false);
  const [uploadedDetails, setUploadedDetails] = useState(false);
  const [sucessPage, setSucessPage] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false);

  const [assetMap, setAssetMap] = useState<{ [uid: string]: Asset }>({});

  const getAssetFromPicker = (uid: string, asset: Asset): void => {
    setAssetMap((prev) => ({ ...prev, [uid]: asset }));
  };
  const setSecond: () => void = () => {
    if (url == "" && fileName == "") {
      setErrorAlert("Please choose file or enter any url for import.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        let errorAlertEl = document.getElementById(
          `errorAlert`
        ) as HTMLInputElement;
        if (errorAlertEl) {
          errorAlertEl.style.display = "none";
        }
      }, 4000);
      return false;
    } else {
      setSecondPage(true);
      setFirstPage(false);
      setSucessPage(false);
      setUploads(true);
    }
  };

  const setCancel: () => void = () => {
    setURL("");
    setFileName("");
    setFileSize(0);
    setSelectedFile(null);
    setSecondPage(false);
    setFirstPage(true);
    setUploads(false);
    setSucessPage(false);
    setLoading(false);
    setSuccessMsg(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setSuccess: () => void = () => {
    setURL("");
    setFileName("");
    setFileSize(0);
    setSelectedFile(null);
    setSecondPage(false);
    setFirstPage(false);
    setUploads(false);
    setSucessPage(true);
  };

  const setUploads = (val: any): void => {
    setUploadedDetails(val);
  };

  const getAIModel = (e: React.SyntheticEvent) => {
    setAIModel((e.target as HTMLInputElement).value);
  };

  useEffect(() => {
    console.log("------------------------v6.1");
    setBaseUrl(window?.location?.origin);
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${window?.location?.origin}/api/get-content-types`
        );
        if (!res.ok) throw new Error("Failed to fetch content types");
        const data = await res.json();
        setContentTypeResult(data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const handleFileSelect = (file: File) => {
    if (url.trim()) {
      //alert("You can't upload a file when a URL is provided.");
      setErrorAlert(`You can't upload a file when a URL is provided.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        let errorAlertEl = document.getElementById(
          `errorAlert`
        ) as HTMLInputElement;
        if (errorAlertEl) {
          errorAlertEl.style.display = "none";
        }
      }, 4000);
      return;
    }
    if (file.type === "application/pdf") {
      setFileName(file.name);
      setFileSize(file.size);
      setSelectedFile(file);
    } else {
      //alert("Please upload a PDF file");
      setErrorAlert(`Please upload a PDF file.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        let errorAlertEl = document.getElementById(
          `errorAlert`
        ) as HTMLInputElement;
        if (errorAlertEl) {
          errorAlertEl.style.display = "none";
        }
      }, 4000);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // const showRegeneratePromptPopup = (id:any) => {
  //   setModalOpen(true);
  // }

  // const regeneratePrompt = async (id:any, value:any) => {
  //     let res = await fetch(`${baseUrl}/api/regenerate-prompt?id=${id}&value=${value}&model=${aiModel}`);
  //     if (!res.ok){
  //       return alert("We're currently experiencing heavy traffic. Please try again in 5 to 15 minutes.");
  //     }

  //     let data = await res.json();
  //     let inputEl = document.getElementById(`${id}`) as HTMLInputElement;
  //     inputEl.value = data?.title;

  //     let inputElMessage = document.getElementById(`${id}_message`) as HTMLInputElement;
  //     inputElMessage.innerHTML = "Regenerated Value has been updated."
  //     inputElMessage.classList.remove("hidden");
  //     setTimeout(() => {
  //       inputElMessage.classList.add("hidden");
  //     }, 4000);
  // }

  // const regeneratePromptWithText = async (id:any, value:any) => {
  //     let res = await fetch(`${baseUrl}/api/regenerate-prompt?id=${id}&value=${value}&model=${aiModel}`);
  //     if (!res.ok){
  //       return alert("We're currently experiencing heavy traffic. Please try again in 5 to 15 minutes.");
  //     }

  //     let data = await res.json();
  //     let inputEl = document.getElementById(`${id}`) as HTMLInputElement;
  //     inputEl.value = data?.title;

  //     let inputElMessage = document.getElementById(`${id}_message`) as HTMLInputElement;
  //     inputElMessage.innerHTML = "Regenerated Value has been updated."
  //     inputElMessage.classList.remove("hidden");
  //     setTimeout(() => {
  //       inputElMessage.classList.add("hidden");
  //     }, 4000);
  // }

  const generateContent = async (e: React.SyntheticEvent) => {
    if (!template) {
      setErrorAlert("Please select a content type.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        let errorAlertEl = document.getElementById(
          `errorAlert`
        ) as HTMLInputElement;
        if (errorAlertEl) {
          errorAlertEl.style.display = "none";
        }
      }, 4000);
      return;
    }

    if ((!selectedFile && !url.trim()) || (selectedFile && url.trim())) {
      //alert("Please provide either a PDF file or a URL, but not both.");
      setErrorAlert("Please provide either a PDF file or a URL, but not both.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        let errorAlertEl = document.getElementById(
          `errorAlert`
        ) as HTMLInputElement;
        if (errorAlertEl) {
          errorAlertEl.style.display = "none";
        }
      }, 4000);
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("template", template);
    formData.append("model", aiModel);
    if (selectedFile) {
      formData.append("pdf", selectedFile);
    } else if (url.trim()) {
      formData.append("url", url.trim());
    }

    try {
      const res = await fetch(
        `${window?.location?.origin}/api/generate-summary`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (res?.status == 200) {
        const data = await res.json();
        setSecondPage(false);
        setFirstPage(false);

        setResult(data?.summary);
        // setReferenceFields(data?.referenceFields);
        // setFileFieldList(data?.fileFieldList);
      } else {
        setCancel();
        setFirstPage(true);
        setErrorAlert(
          "We're currently experiencing heavy traffic. Please try again in 5 to 15 minutes."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.setTimeout(() => {
          let errorAlertEl = document.getElementById(
            `errorAlert`
          ) as HTMLInputElement;
          if (errorAlertEl) {
            errorAlertEl.style.display = "none";
          }
        }, 4000);
      }
    } catch (err) {
      setCancel();
      setFirstPage(true);
      setErrorAlert(
        "We're currently experiencing heavy traffic. Please try again in 5 to 15 minutes."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        let errorAlertEl = document.getElementById(
          `errorAlert`
        ) as HTMLInputElement;
        if (errorAlertEl) {
          errorAlertEl.style.display = "none";
        }
      }, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const input = e.target as HTMLInputElement;
    const inputId = input.id;
    const file = e.target.files?.[0];

    if (file) {
      handleFileUpload(file, inputId);
    }
  };

  const handleFileUpload = async (file: File, inputId: string) => {
    const formData = new FormData();
    formData.append("asset[upload]", file);
    formData.append("asset[title]", file.name);

    try {
      const response = await axios.post(
        "https://api.contentstack.io/v3/assets",
        formData,
        {
          headers: {
            api_key: process.env.API_KEY as string,
            authorization: process.env.AUTHORIZATION as string,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploaded = response.data.asset;
      const inputEl = document.getElementById(`${inputId}_file`);
      console.log("----------inputEl", inputEl);

      if (inputEl && "value" in inputEl) {
        (inputEl as HTMLInputElement).value = uploaded.uid;
        setLoading(false);
      }
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      console.error("Upload failed:", err);
    }
  };

  const handleSubmit = async (isPublish: boolean) => {
    try {
      const data: Record<string, any> = {};
      const componentData: Array<Record<string, any>> = [];

      const textareas =
        document.querySelectorAll<HTMLTextAreaElement>(".form-textarea");
      textareas.forEach((textarea) => {
        let name = textarea.name;
        let value = textarea.value.trim();
        let parentUid = textarea.getAttribute("data-parent-uid") as string;
        let parentToUid = textarea.getAttribute("data-parent-to-uid") as string;
        let isRoot = textarea.getAttribute("data-is-root") as string;

        if (!name || !value) return;

        if (isRoot == "true" && !parentToUid) {
          if (name == "url") {
            if (template == "_technical_solution") {
              data[name] = `/technical-offerings/${data["title"]
                ?.replaceAll(" ", "-")
                ?.replaceAll("_", "-")
                ?.toLowerCase()}`;
            } else if (template == "_case_study") {
              data[name] = `/case-study/${data["title"]
                ?.replaceAll(" ", "-")
                ?.replaceAll("_", "-")
                ?.toLowerCase()}`;
            } else if (template == "blog_post") {
              data[name] = `/blog/${data["title"]
                ?.replaceAll(" ", "-")
                ?.replaceAll("_", "-")
                ?.toLowerCase()}`;
            } else if (template == "page") {
              data[name] = `/${data["title"]
                ?.replaceAll(" ", "-")
                ?.replaceAll("_", "-")
                ?.toLowerCase()}`;
            } else {
              data[name] = `/${template}/${data["title"]
                ?.replaceAll(" ", "-")
                ?.replaceAll("_", "-")
                ?.toLowerCase()}`;
            }
          } else {
            data[name] = value;
          }
        } else if (isRoot == "true" && parentToUid != "") {
          if (!data[parentToUid]) {
            data[parentToUid] = {};
          }

          data[parentToUid][name] = value;
        } else if (parentUid) {
          let existing = componentData.find((comp: any) => comp[parentUid]);
          if (!existing) {
            existing = { [parentUid]: {} };
            componentData.push(existing);
          }
          existing[parentUid][name] = value;
        }
      });

      const formDropdowns =
        document.querySelectorAll<HTMLTextAreaElement>(".form-dropdown");

      formDropdowns.forEach((dropdown) => {
        let id = dropdown.id;
        let name = dropdown.name;
        let value = dropdown.value.trim();
        let parentUid = dropdown.getAttribute("data-parent-uid") as string;
        let parentToUid = dropdown.getAttribute("data-parent-to-uid") as string;
        let isRoot = dropdown.getAttribute("data-is-root") as string;

        if (!name || !value) return;

        const content = [{ uid: value, _content_type_uid: id }];

        if (isRoot == "true" && !parentToUid) {
          data[name] = content;
        } else if (isRoot == "true" && parentToUid != "") {
          let component = componentData.find((comp) => comp[parentUid]);

          if (!component) {
            component = { [parentUid]: { [parentToUid]: {} } };
            componentData.push(component);
          }

          // If parentToUid object doesn't exist inside parentUid, initialize it
          if (!component[parentUid][parentToUid]) {
            component[parentUid][parentToUid] = {};
          }
          component[parentUid][parentToUid][name] = content;
        } else if (!isRoot && parentUid) {
          let component = componentData.find((comp) => comp[parentUid]);
          if (!component) {
            component = { [parentUid]: {} };
            componentData.push(component);
          }
          component[parentUid][name] = content;
        }
      });


      const formDropdownsNormal = document.querySelectorAll<HTMLTextAreaElement>(".form-dropdown-normal");
      formDropdownsNormal.forEach((dropdown) => {
        let id = dropdown.id;
        let name = dropdown.name;
        let value = dropdown.value.trim();
        let parentUid = dropdown.getAttribute("data-parent-uid") as string;
        let parentToUid = dropdown.getAttribute("data-parent-to-uid") as string;
        let isRoot = dropdown.getAttribute("data-is-root") as string;

        if (!name || !value) return;
        const content = value; //[{ uid: value, _content_type_uid: id }];

        if (isRoot == "true" && !parentToUid) {
          data[name] = content;
        } else if (isRoot == "true" && parentToUid != "") {
          let component = componentData.find((comp) => comp[parentUid]);

          if (!component) {
            component = { [parentUid]: { [parentToUid]: {} } };
            componentData.push(component);
          }

          // If parentToUid object doesn't exist inside parentUid, initialize it
          if (!component[parentUid][parentToUid]) {
            component[parentUid][parentToUid] = {};
          }
          component[parentUid][parentToUid][name] = content;
        } else if (!isRoot && parentUid) {
          let component = componentData.find((comp) => comp[parentUid]);
          if (!component) {
            component = { [parentUid]: {} };
            componentData.push(component);
          }
          component[parentUid][name] = content;
        }
      });



      data.page_components = componentData;

      const myHeaders = new Headers();
      myHeaders.append("authorization", process.env.AUTHORIZATION as string);
      myHeaders.append("api_key", process.env.API_KEY as string);
      myHeaders.append("Content-Type", "application/json");

      const raw = JSON.stringify({ entry: { ...data } });

      const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: raw,
      };

      const response = await fetch(
        `https://api.contentstack.io/v3/content_types/${template}/entries/`,
        requestOptions
      );

      const result = await response.json();
      if (result?.error_code == 119) {
        result?.errors
          ? alert(JSON.stringify(result?.errors))
          : alert("Please enter values in required fields.");
        result?.errors
          ? setErrorAlert(JSON.stringify(result?.errors))
          : setErrorAlert(
              "We're currently experiencing heavy traffic. Please try again in 5 to 15 minutes."
            );
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.setTimeout(() => {
          let errorAlertEl = document.getElementById(
            `errorAlert`
          ) as HTMLInputElement;
          if (errorAlertEl) {
            errorAlertEl.style.display = "none";
          }
        }, 4000);

        setLoading(false);
        return false;
      } else {
        let entryId = result?.entry?.uid;
        if (isPublish) {
          publishEntry(entryId);
        }
        setFinalResult(result);
        setSucessPage(true);
        setSuccess();
        setResult(null);
        setLoading(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      //alert(`Error: ${err}`);
      setErrorAlert(`Error: ${err}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => {
        let errorAlertEl = document.getElementById(
          `errorAlert`
        ) as HTMLInputElement;
        if (errorAlertEl) {
          errorAlertEl.style.display = "none";
        }
      }, 4000);

      setLoading(false);
      setSuccessMsg(false);
      setResult(null);
      setCancel();
      //window.location.reload();
    }
  };

  // isPublish:boolean
  const publishEntry = async (EntriyUid: string) => {
    const myHeaders = new Headers();
    myHeaders.append("authorization", process.env.AUTHORIZATION as string);
    myHeaders.append("api_key", process.env.API_KEY as string);
    myHeaders.append("Content-Type", "application/json");

    const data = JSON.stringify({
      entries: [
        {
          uid: EntriyUid,
          content_type: template,
          version: 1,
          locale: "en-us",
        },
      ],
      locales: ["en-us"],
      environments: ["dev"],
      publish_with_reference: true,
      skip_workflow_stage_check: true,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: data,
    };

    const response = await fetch(
      `https://api.contentstack.io/v3/bulk/publish?x-bulk-action=publish`,
      requestOptions
    );

    const publishingResult = await response.json();
  };

  const renderResult = () => {
    if (!result) return null;

    let json: any = result;
    if (typeof result === "string") {
      try {
        json = JSON.parse(result);
      } catch {
        return <div className="alert alert-warning">Invalid result format</div>;
      }
    }

    return (
      <div className="genrate-content">
        <form encType="multipart/form-data" method="post">
          {Object.entries(json as Record<string, any[]>).map(
            (
              [parentUid, fields] //parentUid != '' &&
            ) => (
              <div
                key={parentUid}
                className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200"
              >
                <h2 className="text-2xl font-semibold mb-6 text-purple-700 capitalize">
                  {parentUid == "page_details"
                    ? "Common Details"
                    : parentUid?.replace(/_/g, " ")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fields.map((field: any) => {
                    if (field?.display_type == "radio") {
                      return (
                        <div
                          key={field?.uid}
                          className="mb-4 bg-white border-[var(--border-color)] border-[1px] p-4 rounded-lg"
                        >
                          <label className="mb-2 pl-2">
                            {" "}
                            {field?.display_name}
                          </label>
                          <select
                            name={field?.uid}
                            id={field?.uid}
                            data-parent-uid={parentUid}
                            data-parent-to-uid={field?.parent_to_uid}
                            className="form-select form-dropdown-normal form-textarea1"
                          >
                            <option value="">Choose...</option>
                            {field?.enum?.choices?.map(
                              (ele: any, ind: number) => (
                                  <option key={ind} value={ele?.value}>
                                    {ele?.value}
                                  </option>
                                )
                            )}
                          </select>
                        </div>
                      );
                    }else if (field?.data_type === "text") {
                      return (
                        <div
                          key={field?.uid ?? parentUid}
                          className={`mb-4 bg-white border-[var(--border-color)] border-[1px] p-4 rounded-lg ${
                            field?.is_root === true && field?.uid === "url"
                              ? "hidden"
                              : ""
                          }`}
                        >
                          <div className="label-bar">
                            <label htmlFor={field?.uid} className="mb-2 pl-2">
                              <strong>
                                {field.display_name}{" "}
                                <span className="req">(Required)</span>
                              </strong>
                            </label>
                          </div>
                          <textarea
                            className="form-control form-textarea"
                            data-parent-uid={parentUid}
                            data-parent-to-uid={field?.parent_to_uid}
                            data-is-root={field?.is_root}
                            name={field?.uid}
                            defaultValue={field?.value || ""}
                          />
                        </div>
                      );
                    } else if (field?.data_type === "file") {
                      return (
                        <div
                          key={field?.uid || parentUid}
                          className="mb-4 bg-white border-[var(--border-color)] border-[1px] p-4 rounded-lg"
                        >
                          <div className="label-bar">
                            <label htmlFor={field?.uid} className="mb-2 pl-2">
                              <strong>
                                {field.display_name}
                                <span className="req">(Required)</span>
                              </strong>
                            </label>
                          </div>
                          <AssetPicker
                            setSelectedAssetData={(asset: Asset) =>
                              getAssetFromPicker(field?.uid, asset)
                            }
                          />

                          {/* Hidden input to hold the selected asset URL */}
                          <input
                            type="hidden"
                            className="input_file_field form-textarea"
                            name={field?.uid}
                            id={`${field?.uid}_${parentUid}_input_file`}
                            data-parent-uid={parentUid}
                            data-parent-to-uid={field?.parent_to_uid}
                            data-is-root={field?.is_root}
                            value={
                              assetMap[field?.uid]?.uid ||
                              assetMap[field?.uid]?.asset?.uid
                            }
                          />
                        </div>
                      );
                    } else if (field?.data_type == "reference") {
                      return (
                        <div
                          key={field?.uid}
                          className="mb-4 bg-white border-[var(--border-color)] border-[1px] p-4 rounded-lg"
                        >
                          <label className="mb-2 pl-2">
                            {" "}
                            {field?.display_name}
                          </label>
                          <select
                            name={field?.uid}
                            id={field?.reference_to[0]}
                            data-parent-uid={parentUid}
                            data-parent-to-uid={field?.parent_to_uid}
                            className="form-select form-dropdown form-textarea1"
                          >
                            <option value="">Choose...</option>
                            {field?.values?.entries?.map(
                              (ele: any, ind: number) =>
                                ele?.title ? (
                                  <option key={ind} value={ele?.uid}>
                                    {ele?.title}
                                  </option>
                                ) : null
                            )}
                          </select>
                        </div>
                      );
                    } else {
                      return null; // skip other types for now
                    }
                  })}
                </div>
              </div>
            )
          )}

          <div className="mb-4 flex justify-end bg-white border-[var(--border-color)] border-[1px] p-4 rounded-lg">
            <button className="primary-button" onClick={setCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
            >
              <svg
                width="18"
                height="20"
                viewBox="0 0 18 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.29767 1.33782C1.34434 1.29754 1.40391 1.27604 1.46512 1.27739H12.4007C12.4593 1.27739 12.5146 1.30292 12.5548 1.34547L16.6889 5.89847C16.7246 5.9379 16.7443 5.98957 16.7442 6.04315V18.5813C16.7442 18.6001 16.7367 18.6307 16.7023 18.663C16.6557 18.7033 16.5961 18.7248 16.5349 18.7235H13.7989C13.8089 18.6537 13.814 18.583 13.814 18.5107V13.4045C13.814 13.0095 13.6596 12.6307 13.3848 12.3514C13.1101 12.0721 12.7374 11.9152 12.3488 11.9152H5.65116C5.26259 11.9152 4.88993 12.0721 4.61517 12.3514C4.34041 12.6307 4.18605 13.0095 4.18605 13.4045V18.5107C4.18605 18.583 4.19107 18.6537 4.20112 18.7235H1.46512C1.40391 18.7248 1.34434 18.7033 1.29767 18.663C1.26335 18.6307 1.25581 18.6001 1.25581 18.5813V1.41951C1.25581 1.40079 1.26335 1.37015 1.29767 1.33782ZM5.65116 18.7235H12.3488C12.4043 18.7235 12.4576 18.701 12.4968 18.6611C12.5361 18.6212 12.5581 18.5671 12.5581 18.5107V13.4045C12.5581 13.3481 12.5361 13.294 12.4968 13.2541C12.4576 13.2142 12.4043 13.1918 12.3488 13.1918H5.65116C5.59565 13.1918 5.54242 13.2142 5.50316 13.2541C5.46391 13.294 5.44186 13.3481 5.44186 13.4045V18.5107C5.44186 18.6281 5.53563 18.7235 5.65116 18.7235ZM1.46512 20C1.0934 20 0.726697 19.863 0.448744 19.6034C0.308311 19.4742 0.195887 19.3166 0.118629 19.1408C0.0413709 18.965 0.000970478 18.7747 0 18.5822V1.41866C0 1.02379 0.169116 0.656993 0.448744 0.396579C0.726697 0.137016 1.0934 0 1.46512 0H12.4007C12.8101 0 13.2003 0.173609 13.4774 0.479128L17.6115 5.03213C17.861 5.30701 18 5.66699 18 6.04144V18.5805C18 18.9762 17.8309 19.3422 17.5513 19.6026C17.2733 19.8621 16.9066 19.9991 16.5349 19.9991L1.46512 20Z"
                  fill="#6C5CE7"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.86047 6.32994C5.86047 6.20298 5.91008 6.08122 5.9984 5.99145C6.08671 5.90168 6.2065 5.85124 6.3314 5.85124H10.4128C10.5377 5.85124 10.6575 5.90168 10.7458 5.99145C10.8341 6.08122 10.8837 6.20298 10.8837 6.32994C10.8837 6.4569 10.8341 6.57866 10.7458 6.66844C10.6575 6.75821 10.5377 6.80865 10.4128 6.80865H6.3314C6.2065 6.80865 6.08671 6.75821 5.9984 6.66844C5.91008 6.57866 5.86047 6.4569 5.86047 6.32994Z"
                  fill="#6C5CE7"
                />
              </svg>
              Save
            </button>
            <button
              type="button"
              className="primary-button active"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5014 14.1665L17.1198 13.7422L15.7514 11.7478V14.1665H16.5014ZM16.8793 14.7174L16.2609 15.1417L16.2612 15.1421L16.8793 14.7174ZM13.1249 19.389H12.3749V19.8928L12.8413 20.0833L13.1249 19.389ZM9.84876 16.1959V15.4459L9.84742 15.4459L9.84876 16.1959ZM9.66549 16.1203L9.13517 16.6506L9.13584 16.6513L9.66549 16.1203ZM5.87893 12.3339L5.34795 12.8636L5.34862 12.8643L5.87893 12.3339ZM5.80335 12.1507L6.55335 12.152V12.1507H5.80335ZM2.62769 8.87474L1.92541 9.13798L2.10786 9.62474H2.62769V8.87474ZM7.32128 5.15982L6.90527 5.78387L6.90585 5.78425L7.32128 5.15982ZM7.84107 5.50564L8.2575 4.88187L8.2565 4.88121L7.84107 5.50564ZM8.91273 5.40003L9.44292 5.9305L9.44305 5.93037L8.91273 5.40003ZM9.64789 4.66491L10.1782 5.19526L10.1782 5.19524L9.64789 4.66491ZM16.9901 1.28752L16.9326 0.539729L16.9325 0.539739L16.9901 1.28752ZM20.7218 1.00073L20.6657 0.252825L20.6643 0.25293L20.7218 1.00073ZM20.9993 1.27821L21.7471 1.33568L21.7472 1.33431L20.9993 1.27821ZM20.7125 5.00969L21.4602 5.06723L21.4603 5.06717L20.7125 5.00969ZM17.3349 12.3526L17.8648 12.8833L17.8652 12.8829L17.3349 12.3526ZM16.5997 13.0866L16.0698 12.5559L16.0688 12.5569L16.5997 13.0866ZM16.5014 14.1676L15.8835 14.5928L17.2514 16.5803V14.1676H16.5014ZM4.4586 14.2081C4.75145 13.9152 4.75138 13.4403 4.45844 13.1474C4.1655 12.8546 3.69063 12.8547 3.39778 13.1476L4.4586 14.2081ZM0.46959 16.0767C0.176741 16.3696 0.176812 16.8445 0.46975 17.1373C0.762687 17.4302 1.23756 17.4301 1.53041 17.1372L0.46959 16.0767ZM5.19149 17.8694C5.48445 17.5765 5.48454 17.1017 5.19171 16.8087C4.89887 16.5157 4.424 16.5156 4.13105 16.8085L5.19149 17.8694ZM1.20182 19.7365C0.908872 20.0294 0.908776 20.5042 1.20161 20.7972C1.49444 21.0901 1.96932 21.0902 2.26227 20.7974L1.20182 19.7365ZM8.85201 18.6C9.14481 18.3071 9.14465 17.8322 8.85166 17.5394C8.55867 17.2466 8.0838 17.2467 7.791 17.5397L8.85201 18.6ZM4.86281 20.4698C4.57002 20.7628 4.57017 21.2377 4.86316 21.5305C5.15615 21.8233 5.63102 21.8231 5.92382 21.5302L4.86281 20.4698ZM16.5014 14.1665L15.883 14.5909L16.2609 15.1417L16.8793 14.7174L17.4977 14.293L17.1198 13.7422L16.5014 14.1665ZM16.8793 14.7174L16.2612 15.1421C17.6018 17.0931 15.582 19.5823 13.4084 18.6946L13.1249 19.389L12.8413 20.0833C16.3874 21.5314 19.6856 17.477 17.4974 14.2926L16.8793 14.7174ZM13.1249 19.389H13.8749V17.3586H13.1249H12.3749V19.389H13.1249ZM13.1249 17.3586H13.8749C13.8749 16.3024 13.0182 15.4459 11.9621 15.4459V16.1959V16.9459C12.1899 16.9459 12.3749 17.1309 12.3749 17.3586H13.1249ZM11.9621 16.1959V15.4459H9.84876V16.1959V16.9459H11.9621V16.1959ZM9.84876 16.1959L9.84742 15.4459C9.91197 15.4458 9.97589 15.4584 10.0355 15.483L9.7496 16.1763L9.46366 16.8697C9.58621 16.9202 9.71752 16.9461 9.8501 16.9459L9.84876 16.1959ZM9.7496 16.1763L10.0355 15.483C10.0952 15.5076 10.1494 15.5437 10.1951 15.5893L9.66549 16.1203L9.13584 16.6513C9.22972 16.7449 9.34112 16.8191 9.46366 16.8697L9.7496 16.1763ZM9.66549 16.1203L10.1958 15.5899L6.40925 11.8036L5.87893 12.3339L5.34862 12.8643L9.13517 16.6506L9.66549 16.1203ZM5.87893 12.3339L6.40992 11.8043C6.4555 11.8499 6.49163 11.9042 6.51624 11.9638L5.8229 12.2498L5.12956 12.5358C5.18011 12.6583 5.25432 12.7697 5.34795 12.8636L5.87893 12.3339ZM5.8229 12.2498L6.51624 11.9638C6.54085 12.0235 6.55346 12.0875 6.55335 12.152L5.80335 12.1507L5.05335 12.1493C5.05311 12.2819 5.07901 12.4132 5.12956 12.5358L5.8229 12.2498ZM5.80335 12.1507H6.55335V10.0261H5.80335H5.05335V12.1507H5.80335ZM5.80335 10.0261H6.55335C6.55335 8.97611 5.70188 8.12474 4.65195 8.12474V8.87474V9.62474C4.87353 9.62474 5.05335 9.80461 5.05335 10.0261H5.80335ZM4.65195 8.87474H3.90195V9.65127H4.65195H5.40195V8.87474H4.65195ZM4.65195 8.87474V8.12474H2.62769V8.87474V9.62474H4.65195V8.87474ZM2.62769 8.87474L3.32998 8.6115C2.51822 6.44587 4.96593 4.49104 6.90527 5.78387L7.32128 5.15982L7.73729 4.53577C4.58233 2.43257 0.604185 5.6132 1.92541 9.13798L2.62769 8.87474ZM7.32128 5.15982L6.90585 5.78425L7.42563 6.13007L7.84107 5.50564L8.2565 4.88121L7.73672 4.53539L7.32128 5.15982ZM7.84107 5.50564L7.42463 6.1294C7.73217 6.33472 8.10135 6.4271 8.46934 6.39084L8.39579 5.64445L8.32223 4.89807C8.29943 4.90032 8.27655 4.89459 8.2575 4.88187L7.84107 5.50564ZM8.39579 5.64445L8.46934 6.39084C8.83733 6.35457 9.18138 6.1919 9.44292 5.9305L8.91273 5.40003L8.38255 4.86955C8.36635 4.88574 8.34504 4.89582 8.32223 4.89807L8.39579 5.64445ZM8.91273 5.40003L9.44305 5.93037L10.1782 5.19526L9.64789 4.66491L9.11757 4.13457L8.38242 4.86968L8.91273 5.40003ZM9.64789 4.66491L10.1782 5.19524C12.0175 3.35593 14.4541 2.23511 17.0477 2.03531L16.9901 1.28752L16.9325 0.539739C13.982 0.767036 11.21 2.04211 9.11756 4.13458L9.64789 4.66491ZM16.9901 1.28752L17.0476 2.03532L20.7793 1.74852L20.7218 1.00073L20.6643 0.25293L16.9326 0.539729L16.9901 1.28752ZM20.7218 1.00073L20.7779 1.74862C20.7074 1.75391 20.6366 1.74392 20.5703 1.71933L20.8312 1.01616L21.092 0.312993C20.9559 0.262487 20.8105 0.241966 20.6657 0.252826L20.7218 1.00073ZM20.8312 1.01616L20.5703 1.71933C20.504 1.69474 20.4438 1.65614 20.3939 1.60616L20.9242 1.07581L21.4545 0.54547C21.3518 0.442801 21.2282 0.3635 21.092 0.312993L20.8312 1.01616ZM20.9242 1.07581L20.3939 1.60616C20.3439 1.55615 20.3053 1.49596 20.2807 1.4297L20.9838 1.16881L21.687 0.907918C21.6365 0.771801 21.5572 0.648164 21.4545 0.54547L20.9242 1.07581ZM20.9838 1.16881L20.2807 1.4297C20.2561 1.36342 20.2461 1.29261 20.2514 1.2221L20.9993 1.27821L21.7472 1.33431C21.758 1.18949 21.7375 1.04405 21.687 0.907918L20.9838 1.16881ZM20.9993 1.27821L20.2515 1.22073L19.9647 4.95221L20.7125 5.00969L21.4603 5.06717L21.7471 1.33568L20.9993 1.27821ZM20.7125 5.00969L19.9647 4.95215C19.7651 7.54592 18.6442 9.98274 16.8046 11.8222L17.3349 12.3526L17.8652 12.8829C19.958 10.7903 21.2332 8.01802 21.4602 5.06723L20.7125 5.00969ZM17.3349 12.3526L16.805 11.8218L16.0698 12.5559L16.5997 13.0866L17.1297 13.6174L17.8648 12.8833L17.3349 12.3526ZM16.5997 13.0866L16.0688 12.5569C15.8051 12.8212 15.6422 13.1695 15.6083 13.5414L16.3553 13.6093L17.1022 13.6773C17.1043 13.6543 17.1144 13.6327 17.1307 13.6164L16.5997 13.0866ZM16.3553 13.6093L15.6083 13.5414C15.5745 13.9132 15.6719 14.2852 15.8835 14.5928L16.5014 14.1676L17.1192 13.7424C17.1061 13.7233 17.1001 13.7003 17.1022 13.6773L16.3553 13.6093ZM16.5014 14.1676H17.2514V14.1665H16.5014H15.7514V14.1676H16.5014ZM3.92819 13.6778L3.39778 13.1476L0.46959 16.0767L1 16.6069L1.53041 17.1372L4.4586 14.2081L3.92819 13.6778ZM4.66127 17.3389L4.13105 16.8085L1.20182 19.7365L1.73205 20.267L2.26227 20.7974L5.19149 17.8694L4.66127 17.3389ZM8.32151 18.0699L7.791 17.5397L4.86281 20.4698L5.39332 21L5.92382 21.5302L8.85201 18.6L8.32151 18.0699ZM15.8263 9.468L15.296 8.93766C14.679 9.55454 13.6788 9.55454 13.0619 8.93766L12.5316 9.468L12.0012 9.99834C13.2039 11.201 15.1539 11.201 16.3566 9.99834L15.8263 9.468ZM12.5316 9.468L13.0619 8.93766C12.445 8.32079 12.445 7.32067 13.0619 6.7038L12.5316 6.17346L12.0012 5.64312C10.7985 6.84578 10.7985 8.79569 12.0012 9.99834L12.5316 9.468ZM12.5316 6.17346L13.0619 6.7038C13.6788 6.08692 14.679 6.08692 15.296 6.7038L15.8263 6.17346L16.3566 5.64312C15.1539 4.44048 13.2039 4.44048 12.0012 5.64312L12.5316 6.17346ZM15.8263 6.17346L15.296 6.7038C15.9129 7.32067 15.9129 8.32079 15.296 8.93766L15.8263 9.468L16.3566 9.99834C17.5593 8.79569 17.5593 6.84578 16.3566 5.64312L15.8263 6.17346Z"
                  fill="white"
                />
              </svg>
              Publish to CMS
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container py-3">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <img src="/spinner.webp" alt="Loading..." className="w-16 h-16" />
        </div>
      )}

      <div className="w-full">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex justify-between w-full items-center">
              <h1 className="flex items-center">
                Content Bridge AI
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-4"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 1.5625C5.34025 1.5625 1.5625 5.34025 1.5625 10C1.5625 14.6597 5.34025 18.4375 10 18.4375C14.6597 18.4375 18.4375 14.6597 18.4375 10C18.4375 5.34025 14.6597 1.5625 10 1.5625ZM0.4375 10C0.4375 4.7185 4.7185 0.4375 10 0.4375C15.2815 0.4375 19.5625 4.7185 19.5625 10C19.5625 15.2815 15.2815 19.5625 10 19.5625C4.7185 19.5625 0.4375 15.2815 0.4375 10Z"
                    fill="#6E6B86"
                  />
                  <path
                    d="M10 15.8125C10.2486 15.8125 10.4871 15.7137 10.6629 15.5379C10.8387 15.3621 10.9375 15.1236 10.9375 14.875C10.9375 14.6264 10.8387 14.3879 10.6629 14.2121C10.4871 14.0363 10.2486 13.9375 10 13.9375C9.75136 13.9375 9.5129 14.0363 9.33709 14.2121C9.16127 14.3879 9.0625 14.6264 9.0625 14.875C9.0625 15.1236 9.16127 15.3621 9.33709 15.5379C9.5129 15.7137 9.75136 15.8125 10 15.8125Z"
                    fill="#6E6B86"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.7805 5.1805C9.19392 5.00933 9.63875 4.92712 10.086 4.93922C10.5333 4.95131 10.9731 5.05745 11.3766 5.25071C11.7802 5.44398 12.1385 5.72005 12.4284 6.06095C12.7182 6.40186 12.933 6.79997 13.0588 7.22937C13.1846 7.65878 13.2186 8.10986 13.1585 8.55326C13.0985 8.99667 12.9458 9.42247 12.7103 9.80295C12.4748 10.1834 12.1619 10.5101 11.7918 10.7616C11.4218 11.0132 11.0029 11.184 10.5625 11.263V11.5C10.5625 11.6492 10.5032 11.7923 10.3977 11.8977C10.2923 12.0032 10.1492 12.0625 10 12.0625C9.85082 12.0625 9.70774 12.0032 9.60225 11.8977C9.49676 11.7923 9.4375 11.6492 9.4375 11.5V10.75C9.4375 10.6008 9.49676 10.4577 9.60225 10.3523C9.70774 10.2468 9.85082 10.1875 10 10.1875C10.4079 10.1875 10.8067 10.0665 11.1459 9.83991C11.485 9.61328 11.7494 9.29116 11.9055 8.91428C12.0616 8.53741 12.1025 8.12271 12.0229 7.72263C11.9433 7.32254 11.7469 6.95504 11.4584 6.66659C11.17 6.37815 10.8025 6.18171 10.4024 6.10213C10.0023 6.02255 9.58759 6.06339 9.21072 6.2195C8.83384 6.3756 8.51172 6.63996 8.28509 6.97914C8.05846 7.31831 7.9375 7.71708 7.9375 8.125C7.9375 8.27418 7.87824 8.41726 7.77275 8.52275C7.66726 8.62824 7.52418 8.6875 7.375 8.6875C7.22582 8.6875 7.08274 8.62824 6.97725 8.52275C6.87176 8.41726 6.8125 8.27418 6.8125 8.125C6.8126 7.4946 6.99962 6.87838 7.34992 6.35427C7.70022 5.83016 8.19806 5.42168 8.7805 5.1805Z"
                    fill="#6E6B86"
                  />
                </svg>
              </h1>
              <Settings model={aiModel} setAIModel={getAIModel} />
            </div>
          </div>
        </div>
      </div>

      {errorAlert && (
        <div
          id="errorAlert"
          className="alert alert-danger alert-dismissible fade show text-center"
          role="alert"
        >
          {errorAlert}
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
        </div>
      )}

      {firstPage && (
        <div
          className="text-center mb-5"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="bg-white border-[var(--border-color)] border-t-[1px] border-l-[1px] border-r-[1px] pb-4 rounded-t-lg">
            <div className="topicon flex justify-center py-4">
              <svg
                width="68"
                height="64"
                viewBox="0 0 68 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.17021 38.5096C2.74579 38.5096 3.29779 38.7383 3.70478 39.1453C4.11178 39.5523 4.34043 40.1043 4.34043 40.6799V58.0416C4.34043 58.4409 4.66451 58.765 5.06383 58.765H62.9362C63.128 58.765 63.312 58.6887 63.4477 58.5531C63.5834 58.4174 63.6596 58.2334 63.6596 58.0416V40.6799C63.6596 40.1043 63.8882 39.5523 64.2952 39.1453C64.7022 38.7383 65.2542 38.5096 65.8298 38.5096C66.4054 38.5096 66.9574 38.7383 67.3644 39.1453C67.7714 39.5523 68 40.1043 68 40.6799V58.0416C68 59.3846 67.4665 60.6726 66.5168 61.6222C65.5672 62.5719 64.2792 63.1054 62.9362 63.1054H5.06383C3.72082 63.1054 2.43281 62.5719 1.48316 61.6222C0.533508 60.6726 0 59.3846 0 58.0416V40.6799C0 40.1043 0.228646 39.5523 0.63564 39.1453C1.04263 38.7383 1.59464 38.5096 2.17021 38.5096Z"
                  fill="#101010"
                  fillOpacity="0.3"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.6551 15.3405L32.4664 1.52922C32.8733 1.12281 33.4249 0.894531 34 0.894531C34.5751 0.894531 35.1267 1.12281 35.5336 1.52922L49.3448 15.3405C49.7282 15.7519 49.9369 16.296 49.927 16.8582C49.9171 17.4205 49.6893 17.9569 49.2917 18.3545C48.8941 18.7521 48.3576 18.9799 47.7954 18.9898C47.2332 18.9997 46.689 18.791 46.2776 18.4077L36.1702 8.30317V52.2543C36.1702 52.8299 35.9416 53.3819 35.5346 53.7889C35.1276 54.1959 34.5756 54.4245 34 54.4245C33.4244 54.4245 32.8724 54.1959 32.4654 53.7889C32.0584 53.3819 31.8298 52.8299 31.8298 52.2543V8.30028L21.7253 18.4106C21.5266 18.6238 21.287 18.7948 21.0208 18.9134C20.7546 19.032 20.4672 19.0958 20.1758 19.101C19.8844 19.1061 19.595 19.0525 19.3247 18.9434C19.0545 18.8342 18.809 18.6717 18.603 18.4657C18.3969 18.2596 18.2344 18.0141 18.1253 17.7439C18.0161 17.4737 17.9625 17.1842 17.9676 16.8928C17.9728 16.6014 18.0366 16.314 18.1552 16.0478C18.2738 15.7816 18.4448 15.542 18.658 15.3433L18.6551 15.3405Z"
                  fill="#101010"
                  fillOpacity="0.3"
                />
              </svg>
            </div>

            <div className="flex justify-center flex-col md:flex-row py-2">
              <div className="drag-box w-1/2 text-right pr-6">
                Drag & drop or
                <mark className="text-[var(--blue-color)] bg-transparent">
                  <button
                    className="bg-transparent"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!!url.trim()}
                  >
                    Choose File
                  </button>
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={(e) =>
                      e.target.files?.[0] && handleFileSelect(e.target.files[0])
                    }
                  />
                  {selectedFile && (
                    <p className="mt-2 text-muted hidden">
                      Selected file: {selectedFile.name}
                    </p>
                  )}
                </mark>{" "}
                to upload <br />
                <span>Supported formats: PDF, DOCX, TXT</span>
              </div>
              <div className="or-divider flex justify-center items-center flex-col">
                <span>or</span>
              </div>
              <div className="import-box w-1/2 text-left pl-6">
                <label htmlFor="url" className="form-label">
                  Import from URL
                </label>
                <input
                  type="url"
                  id="url"
                  className="form-control url-input"
                  placeholder="Paste URL here"
                  value={url}
                  disabled={!!selectedFile}
                  onChange={(e) => setURL(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white flex justify-content-end border-b-[1px] border-t-[1px] border-l-[1px] border-r-[1px] p-4 rounded-b-lg">
            <button className="primary-button" onClick={setCancel}>
              Cancel
            </button>
            <button className="primary-button active" onClick={setSecond}>
              Import
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Document and Url Details Are Below */}
      {uploadedDetails && (
        <div className="bg-white border-[var(--border-color)] border-[1px] p-4 flex items-center justify-between mb-4 rounded-lg">
          <span className="w-1/2 flex items-center">
            {fileName && (
              <>
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.7651 65.2653C18.7651 64.7132 18.9845 64.1838 19.3748 63.7934C19.7652 63.403 20.2947 63.1837 20.8468 63.1837H25.7039C28.4643 63.1837 31.1117 64.2803 33.0636 66.2322C35.0155 68.1841 36.1121 70.8314 36.1121 73.5918C36.1121 76.3523 35.0155 78.9996 33.0636 80.9515C31.1117 82.9034 28.4643 84 25.7039 84H20.8468C20.2947 84 19.7652 83.7807 19.3748 83.3903C18.9845 82.9999 18.7651 82.4705 18.7651 81.9184V65.2653ZM22.9284 67.3469V79.8367H25.7039C27.3602 79.8367 28.9486 79.1788 30.1197 78.0076C31.2909 76.8365 31.9488 75.2481 31.9488 73.5918C31.9488 71.9356 31.2909 70.3472 30.1197 69.176C28.9486 68.0049 27.3602 67.3469 25.7039 67.3469H22.9284ZM50.6835 67.3469C47.7859 67.3469 45.1325 69.9698 45.1325 73.5918C45.1325 77.2139 47.7859 79.8367 50.6835 79.8367C53.5811 79.8367 56.2345 77.2139 56.2345 73.5918C56.2345 69.9698 53.5811 67.3469 50.6835 67.3469ZM40.9692 73.5918C40.9692 68.0186 45.1519 63.1837 50.6835 63.1837C56.2151 63.1837 60.3978 68.0186 60.3978 73.5918C60.3978 79.1651 56.2151 84 50.6835 84C45.1519 84 40.9692 79.1651 40.9692 73.5918ZM74.267 67.3469C71.3527 67.3525 68.7243 69.9559 68.7243 73.5918C68.7243 77.2278 71.3555 79.8312 74.267 79.8367C75.5493 79.8229 76.7816 79.3371 77.7281 78.474C77.9291 78.2852 78.1655 78.1383 78.4238 78.0417C78.682 77.945 78.9569 77.9007 79.2324 77.9112C79.5079 77.9217 79.7786 77.9868 80.0287 78.1028C80.2789 78.2188 80.5035 78.3833 80.6895 78.5868C80.8756 78.7903 81.0193 79.0287 81.1124 79.2882C81.2056 79.5477 81.2462 79.8232 81.232 80.0985C81.2178 80.3739 81.1491 80.6437 81.0297 80.8922C80.9104 81.1408 80.7429 81.3632 80.5369 81.5464C78.8296 83.1073 76.6052 83.9813 74.292 84H74.2753C68.7243 84 64.5611 79.1817 64.5611 73.5918C64.5611 68.002 68.7243 63.1837 74.2753 63.1837H74.292C76.6052 63.2024 78.8296 64.0763 80.5369 65.6372C80.7429 65.8205 80.9104 66.0429 81.0297 66.2914C81.1491 66.54 81.2178 66.8098 81.232 67.0851C81.2462 67.3605 81.2056 67.6359 81.1124 67.8955C81.0193 68.155 80.8756 68.3934 80.6895 68.5969C80.5035 68.8004 80.2789 68.9649 80.0287 69.0809C79.7786 69.1969 79.5079 69.262 79.2324 69.2725C78.9569 69.283 78.682 69.2386 78.4238 69.142C78.1655 69.0454 77.9291 68.8985 77.7281 68.7097C76.7817 67.8446 75.5492 67.3593 74.267 67.3469ZM25.01 20.1633C24.826 20.1633 24.6495 20.2364 24.5194 20.3665C24.3893 20.4966 24.3162 20.6731 24.3162 20.8571V51.3878C24.3162 51.9398 24.0968 52.4693 23.7065 52.8597C23.3161 53.2501 22.7866 53.4694 22.2345 53.4694C21.6824 53.4694 21.153 53.2501 20.7626 52.8597C20.3722 52.4693 20.1529 51.9398 20.1529 51.3878V20.8571C20.1529 19.5689 20.6646 18.3335 21.5755 17.4226C22.4864 16.5117 23.7218 16 25.01 16H58.3162C58.8681 16.0005 59.3972 16.2201 59.7872 16.6106L79.2158 36.0392C79.6071 36.4278 79.8264 36.9579 79.8264 37.5102V51.3878C79.8264 51.9398 79.6071 52.4693 79.2167 52.8597C78.8263 53.2501 78.2968 53.4694 77.7447 53.4694C77.1926 53.4694 76.6632 53.2501 76.2728 52.8597C75.8824 52.4693 75.6631 51.9398 75.6631 51.3878V38.3706L57.4558 20.1633H25.01Z"
                    fill="#475161"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M58.3162 16C58.8681 16.0005 59.3972 16.2201 59.7872 16.6106C60.1776 17.001 60.3978 17.5295 60.3978 18.0816V35.4286H77.7447C78.2968 35.4286 78.8254 35.6488 79.2158 36.0392C79.6071 36.4278 79.8264 36.9579 79.8264 37.5102C79.8264 38.0623 79.6071 38.5918 79.2167 38.9821C78.8263 39.3725 78.2968 39.5918 77.7447 39.5918H58.3162C57.7641 39.5918 57.2346 39.3725 56.8442 38.9821C56.4538 38.5918 56.2345 38.0623 56.2345 37.5102V18.0816C56.2345 17.5295 56.4538 17.0001 56.8442 16.6097C57.2346 16.2193 57.7641 16 58.3162 16Z"
                    fill="#475161"
                  />
                </svg>
                <h3>{fileName}</h3>
              </>
            )}

            {url && (
              <>
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24.4681 23.8298C24.2988 23.8298 24.1364 23.897 24.0167 24.0167C23.897 24.1364 23.8298 24.2988 23.8298 24.4681V75.5319C23.8298 75.8843 24.1157 76.1702 24.4681 76.1702H75.5319C75.7012 76.1702 75.8636 76.103 75.9833 75.9833C76.103 75.8636 76.1702 75.7012 76.1702 75.5319V58.4255C76.1702 57.9177 76.372 57.4306 76.7311 57.0715C77.0902 56.7124 77.5772 56.5106 78.0851 56.5106C78.593 56.5106 79.08 56.7124 79.4391 57.0715C79.7983 57.4306 80 57.9177 80 58.4255V75.5319C80 76.7169 79.5293 77.8534 78.6913 78.6913C77.8534 79.5293 76.7169 80 75.5319 80H24.4681C23.2831 80 22.1466 79.5293 21.3087 78.6913C20.4707 77.8534 20 76.7169 20 75.5319V24.4681C20 22.0017 22.0017 20 24.4681 20H41.5745C42.0823 20 42.5694 20.2017 42.9285 20.5609C43.2876 20.92 43.4894 21.407 43.4894 21.9149C43.4894 22.4228 43.2876 22.9098 42.9285 23.2689C42.5694 23.628 42.0823 23.8298 41.5745 23.8298H24.4681ZM56.5106 21.9149C56.5106 21.407 56.7124 20.92 57.0715 20.5609C57.4306 20.2017 57.9177 20 58.4255 20H75.537C78.0136 20 80 22.0068 80 24.4681V28.9362H76.1702V24.4681C76.1702 24.1106 75.8843 23.8298 75.537 23.8298H58.4255C57.9177 23.8298 57.4306 23.628 57.0715 23.2689C56.7124 22.9098 56.5106 22.4228 56.5106 21.9149ZM76.1702 28.9362V41.5745C76.1702 42.0823 76.372 42.5694 76.7311 42.9285C77.0902 43.2876 77.5772 43.4894 78.0851 43.4894C78.593 43.4894 79.08 43.2876 79.4391 42.9285C79.7983 42.5694 80 42.0823 80 41.5745V28.9362H76.1702Z"
                    fill="#475161"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M76.8851 23.1149C77.2437 23.4739 77.4451 23.9606 77.4451 24.4681C77.4451 24.9755 77.2437 25.4622 76.8851 25.8213L43.6936 59.0128C43.5183 59.2009 43.3069 59.3518 43.072 59.4565C42.8371 59.5611 42.5836 59.6174 42.3264 59.6219C42.0693 59.6265 41.8139 59.5792 41.5755 59.4829C41.3371 59.3866 41.1205 59.2432 40.9386 59.0614C40.7568 58.8795 40.6134 58.6629 40.5171 58.4245C40.4208 58.1861 40.3735 57.9307 40.3781 57.6736C40.3826 57.4164 40.4389 57.1629 40.5435 56.928C40.6482 56.6931 40.7991 56.4817 40.9872 56.3064L74.1787 23.1149C74.5378 22.7563 75.0245 22.5549 75.5319 22.5549C76.0394 22.5549 76.5261 22.7563 76.8851 23.1149Z"
                    fill="#475161"
                  />
                </svg>
                <h3>{url}</h3>
              </>
            )}
          </span>

          {fileName && fileSize && (
            <span className="w-1/2 flex items-center justify-end">
              {fileSize} KB
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-4"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M19.8442 6.65567C19.9439 6.75548 20 6.89077 20 7.03184C20 7.1729 19.9439 7.30819 19.8442 7.408L9.89657 17.3443C9.79665 17.444 9.66121 17.5 9.51999 17.5C9.37877 17.5 9.24332 17.444 9.1434 17.3443L4.16961 12.3762C4.11725 12.3274 4.07526 12.2687 4.04613 12.2034C4.01701 12.1381 4.00135 12.0676 4.00008 11.9961C3.99882 11.9246 4.01198 11.8536 4.03879 11.7874C4.06559 11.7211 4.10548 11.6609 4.15608 11.6103C4.20669 11.5598 4.26697 11.5199 4.33332 11.4932C4.39968 11.4664 4.47075 11.4532 4.54231 11.4545C4.61386 11.4558 4.68443 11.4714 4.7498 11.5005C4.81517 11.5296 4.874 11.5715 4.92279 11.6238L9.51999 16.2158L19.091 6.65567C19.1909 6.55599 19.3263 6.5 19.4676 6.5C19.6088 6.5 19.7442 6.55599 19.8442 6.65567Z"
                  fill="#198754"
                  stroke="#198754"
                  stroke-width="2"
                />
              </svg>
            </span>
          )}
        </div>
      )}

      {/* Uploaded Document and Url Details */}

      {secondPage && (
        <div className="mb-5">
          <div className="bg-white content-box">
            <div className="border-[var(--border-color)] border-t-[1px] rounded-t-lg border-l-[1px] border-r-[1px] border-b-[1px] p-4">
              <h2>Select Content Types</h2>
            </div>
            <div className="p-4 border-[var(--border-color)] border-l-[1px] border-r-[1px]">
              {contentTypeResult?.content_types?.map(
                (field: { options: any; title: string; uid: string }) =>
                  field.options.is_page && (
                    <div className="form-check" key={field.uid}>
                      <label className="form-check-label">
                        <input
                          type="radio"
                          className="form-check-input"
                          name="template"
                          value={field.uid}
                          checked={template === field.uid}
                          onChange={() => setTemplate(field.uid)}
                        />
                        {field.title}
                      </label>
                    </div>
                  )
              )}
            </div>
          </div>
          <div className="bg-white flex justify-content-end border-b-[1px] border-t-[1px] border-l-[1px] border-r-[1px] p-4 rounded-b-lg">
            <button
              className="primary-button"
              type="button"
              onClick={setCancel}
            >
              Cancel
            </button>
            <button
              className="bg-[var(--blue-color)] primary-button active flex space-x-4"
              disabled={!template || (!selectedFile && !url.trim()) || loading}
              onClick={generateContent}
              type="button"
            >
              <>
                <svg
                  width="21"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.6492 18.2645H6.27425M11.75 6.19402L1.25 16.694M18.5 12.2645V16.7645M20.75 14.5145H16.25M14.93 9.37477C15.7538 8.52615 16.2106 7.38752 16.2018 6.20488C16.193 5.02224 15.7193 3.89053 14.883 3.05425C14.0467 2.21797 12.915 1.74427 11.7324 1.73548C10.5497 1.72669 9.41112 2.18351 8.5625 3.00727L3.5 8.06977V14.4448H9.875L14.93 9.37477Z"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
                Generate Content
              </>
            </button>
          </div>
        </div>
      )}

      {renderResult()}

      {sucessPage && (
        <div className="new-page">
          <div className="bg-white flex items-center space-x-4 border-[var(--border-color)] border-t-[1px] rounded-t-lg border-l-[1px] border-r-[1px] border-b-[1px] p-4">
            <h2>New Page - {finalResult?.entry?.title}</h2>
            <button
              className="primary-button"
              type="button"
              onClick={setCancel}
            >
              Click Here To Import More
            </button>
          </div>
          <div className="bg-white p-4 border-[var(--border-color)] border-l-[1px] border-b-[1px] border-r-[1px] rounded-b-lg">
            <a
              className="btn btn-primary"
              href="https://app.contentstack.com/#!/stack/blta0ff3cef332c7e34/entries?branch=main&page=1&page_size=30&popular_view=entries-only-base&query=%7B%22queryObject%22%3A%7B%22%24and%22%3A%5B%7B%22_variants%22%3A%7B%22%24in%22%3A%5B%22%24baseVariant%22%5D%7D%7D%5D%7D%2C%22show_loc%22%3Atrue%7D"
            >
              Click Here To Check Entry
            </a>
            {/* <p className="mb-4">Summary: {finalResult?.entry?.summary}</p> */}
          </div>
        </div>
      )}
    </div>
  );
}

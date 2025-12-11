import { useState } from "react";
interface SettingsProps {
  model: string;
  setAIModel: (value: React.SyntheticEvent) => void;
  prompt: string;
  setPrompt: (value: string) => void;
  brandWebsite: string;
  setBrandWebsite: (value: string) => void;
}
const Settings: React.FC<SettingsProps> = ({
  model,
  setAIModel,
  prompt,
  setPrompt,
  brandWebsite,
  setBrandWebsite,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-end gap-2">
        <button className="primary-button" onClick={() => setModalOpen(true)}>
          Settings
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center modal-body">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Settings</h2>
              <button onClick={() => setModalOpen(false)}>X</button>
            </div>
            {/* Model */}
            <div className="mb-4">
              <label className="block mb-1 text-black py-3">Model:</label>
              <select
                value={model}
                onChange={(e) => setAIModel(e)}
                className="form-select form-dropdown form-textarea"
              >
                <option value="custom_bot">Custom Bot</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gpt-4o">GPT-4O</option>
              </select>
            </div>
            {/* Prompt */}
            <div className="mb-4">
              <label className="block mb-1 text-black py-3">
                Custom Prompt:
              </label>
              <textarea
                className="form-control form-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)} // ✅ FIXED
                rows={3}
                placeholder="Rewrite in a more engaging style..."
              />
            </div>
            {/* Brand Website */}
            <div className="mb-4">
              <label className="block mb-1 text-black py-3">
                Brand Website:
              </label>
              <input
                type="text"
                className="form-control form-textarea"
                value={brandWebsite}
                onChange={(e) => setBrandWebsite(e.target.value)} // ✅ FIXED
                placeholder="https://www.espire.com/about-us/espire-group"
              />
            </div>
            <div className="flex justify-end">
              <button
                className="primary-button"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Settings;

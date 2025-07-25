import { useState } from "react";

interface SettingsProps {
  model: string;
  setAIModel: (value: React.SyntheticEvent) => void;
}

const Settings: React.FC<SettingsProps> = ({ model, setAIModel }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <div>
      <div className="flex justify-end gap-2">
        <button
          className="primary-button"
          onClick={() => setModalOpen(true)}
        >
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

            <div className="mb-4 ">
              <label className="block mb-1 text-black py-3">Model:</label>
              <select
                value={model}
                onChange={(e) => setAIModel(e)}
                className="form-select form-dropdown form-textarea"
              >
                 <option value="custom_bot">Custom Bot</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gpt-4o">GPT-4.O</option>
                
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="primary-button"
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

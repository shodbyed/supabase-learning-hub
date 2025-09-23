import { useState } from 'react';
import { FaRegSave, FaRegEdit } from 'react-icons/fa';

import './components.css';

type ViewToEditTextFieldProps = {
  label: string;
  value: string;
  onSave: (value: string, label: string) => void;
};

export const ViewToEditTextField = ({
  label,
  value,
  onSave,
}: ViewToEditTextFieldProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(inputValue, label);
    setIsEditing(false);
  };
  return (
    <div className="view-edit-group">
      <div className="view-edit-label">{label}:</div>
      {isEditing ? (
        <>
          <FaRegSave className="view-edit-icon" onClick={handleSave} />
          <input
            className="edit-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </>
      ) : (
        <>
          <FaRegEdit
            className="view-edit-icon"
            onClick={() => setIsEditing(true)}
          />
          <div className="view-edit-value">{value}</div>
        </>
      )}
    </div>
  );
};

import { useState } from "react";
import "./components.css";
import { FaRegSave, FaRegEdit } from "react-icons/fa";
// import { TextInput } from './TextInput';
import { UseFormRegister } from "react-hook-form";
import { FormValues } from "../newPlayers/profileSchema";

interface EditDataInputProps {
  fieldName: keyof FormValues;
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors: string | undefined;
  register: UseFormRegister<FormValues>;
}

export const EditDataInput = ({
  fieldName,
  label,
  value,
  onChange,
  register,
  errors,
}: EditDataInputProps) => {
  const [isEditing, setIsEditing] = useState(false);

  //   useEffect(() => {
  //     const handleClickOutside = (event: MouseEvent) =>{
  //         if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
  //           setIsEditing(false);
  //         }
  //     }
  //     document.addEventListener('click', handleClickOutside, true);
  //     return () => {
  //       document.removeEventListener('click', handleClickOutside, true);
  //     };
  //   }, [ref]);

  return (
    <>
      <div className="edit-input-container">
        <div>{label}:</div>
        {isEditing ? (
          <input
            {...register(fieldName, { required: true })}
            className="edit-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <div className="edit-input" onClick={() => setIsEditing(true)}>
            {value}
          </div>
        )}
        {isEditing ? (
          <FaRegSave onClick={() => setIsEditing(false)} />
        ) : (
          <FaRegEdit onClick={() => setIsEditing(true)} />
        )}
      </div>
      {errors && <span className="error-message">{errors}</span>}
    </>
  );
};

import React, { useState } from "react";
// components
import { FieldEntryDialog } from "../components/FieldEntryDialog";

// utilities
import { PastPlayerProfileFields, profileFields } from "./buttonFields";
import { formatName, formatPhoneNumber } from "../assets/globalFunctions";
import { validatePastPlayerFields } from "../assets/validateFields";
import { toast } from "react-toastify";

// firebase
//import { Email, fetchPastPlayerByIdRQ, PastPlayer } from "bca--firebase-queries";
import { fetchPastPlayerByIdRQ } from "../hooks/playerFetchHooks";
import { Email, PastPlayer } from "bca-firebase-queries";

type Props = {
  pastPlayer: PastPlayer;
  setChosenPastPlayer: React.Dispatch<React.SetStateAction<PastPlayer | null>>;
};

export const ProfileFields = ({ pastPlayer, setChosenPastPlayer }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string | null>(null);
  const [currentFieldName, setCurrentFieldName] = useState<
    keyof PastPlayerProfileFields | null
  >(null);

  const handleDialogOpen = (
    fieldName: keyof PastPlayerProfileFields,
    name: string
  ) => {
    setTitle(`Enter a new ${name}`);
    setCurrentFieldName(fieldName);
    setIsOpen(true);
  };

  const handleDialogClose = async (value: string) => {
    setIsOpen(false);
    if (!currentFieldName) return;
    let processedValue = value;
    if (!currentFieldName || value === null || value === "") return;
    if (currentFieldName === "city") {
      processedValue = formatName(processedValue);
    }
    if (currentFieldName === "phone") {
      processedValue = formatPhoneNumber(processedValue);
      const validPhone = validatePastPlayerFields(
        "strictPhone",
        processedValue
      );
      if (!validPhone) return;
    }
    const validated = validatePastPlayerFields(
      currentFieldName,
      processedValue
    );
    if (!validated) {
      toast.warn("Invalid value");
      return;
    }
    try {
      // await updatePlayer(currentFieldName, processedValue);
      const updatedPlayer = await fetchPastPlayerByIdRQ(
        pastPlayer.email as Email
      ); //refetch pastPlayer
      if (updatedPlayer) {
        setChosenPastPlayer(updatedPlayer as PastPlayer);
      }
    } catch (error) {
      console.log("Error updating pastPlayer", error);
    }
    setCurrentFieldName(null);
  };

  /*
  const updatePlayer = async (
    fieldName: keyof PastPlayerProfileFields,
    value: string,
  ) => {
    try {
      Updates.updatePastPlayerProfile(pastPlayer.email, {
        [fieldName]: value,
      });
      toast.success(`${fieldName} updated successfully`);
    } catch (error) {
      console.log('Error updating pastPlayer', error);
    }
  };
   */

  return (
    <>
      {profileFields.map((field) => {
        const fieldName = field.fieldName as keyof PastPlayerProfileFields;
        return (
          <React.Fragment key={field.fieldName}>
            <div className="grid-label">{field.name}:</div>
            <button
              className="grid-value text-button"
              onClick={() => handleDialogOpen(fieldName, field.name)}
            >
              {pastPlayer[fieldName]}
            </button>
          </React.Fragment>
        );
      })}
      <FieldEntryDialog<string>
        title={title ? title : ""}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        setValue={(value) => handleDialogClose(value)}
      />
    </>
  );
};

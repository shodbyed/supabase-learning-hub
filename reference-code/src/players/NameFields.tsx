import React, { useState } from "react";

// utilities
import { toast } from "react-toastify";
import { nameFields } from "./buttonFields";
import { formatName } from "../assets/globalFunctions";
import { validatePastPlayerFields } from "../assets/validateFields";

// components
import { FieldEntryDialog } from "../components/FieldEntryDialog";

// types
import { Names } from "../assets/typesFolder/sharedTypes";

// firebase
import { fetchPastPlayerByIdRQ } from "../hooks/playerFetchHooks";
import { Email, PastPlayer } from "bca-firebase-queries";
//import { fetchPastPlayerByIdRQ, PastPlayer, Email } from "bca--firebase-queries";

type Props = {
  pastPlayer: PastPlayer;
  setChosenPastPlayer: React.Dispatch<React.SetStateAction<PastPlayer | null>>;
};

export const NameFields = ({ pastPlayer, setChosenPastPlayer }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string | null>(null);
  const [currentFieldName, setCurrentFieldName] = useState<keyof Names | null>(
    null
  );

  const handleDialogOpen = (fieldName: keyof Names, name: string) => {
    setTitle(`Enter a new ${name}`);
    setCurrentFieldName(fieldName);
    setIsOpen(true);
  };

  const handleDialogClose = async (value: string) => {
    setIsOpen(false);
    if (!currentFieldName) return;
    let processedValue = value;
    if (!currentFieldName || value === null || value === "") return;
    processedValue =
      currentFieldName !== "nickname" ? formatName(value) : value;

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
  };
  /*
  const updatePlayer = async (fieldName: keyof Names, value: string) => {
    const userId = pastPlayer.currentUserId || null;
    try {
      Updates.updatePastPlayerProfile(pastPlayer.email, {
        [fieldName]: value,
      });
      userId &&
        Updates.updateUserProfile(userId, {
          [fieldName]: value,
        });
      toast.success(`${fieldName} updated successfully`);
    } catch (error) {
      console.log('Error updating pastPlayer', error);
    }
    setCurrentFieldName(null);
  };
   */
  return (
    <>
      {nameFields.map((field) => {
        const fieldName = field.fieldName as keyof Names;
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

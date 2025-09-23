// utilities
// import { formatName } from "../assets/globalFunctions";
// import { toast } from 'react-toastify';

// types
// import { Email, Names } from "../assets/typesFolder/sharedTypes";
// import { PastPlayer, CurrentUser } from '../assets/typesFolder/userTypes';

// firebase

/*
export const handleUpdatePastPlayer = async (
  email: Email | null,
  fieldName: keyof PastPlayer,
  value: string,
) => {
  const data = { [fieldName]: value };
  try {
    if (email) {
      await Updates.updatePastPlayerProfile(email, data);
      toast.success(`${fieldName} updated successfully`);
    }
  } catch (error) {
    console.log('Error updating pastPlayer', error);
  }
};

export const handleUpdateCurrentUser = async (
  id: string | null,
  fieldName: keyof CurrentUser,
  value: string,
) => {
  const data = { [fieldName]: value };
  try {
    if (id) {
      await Updates.updateUserProfile(id, data);
      toast.success(`${fieldName} updated successfully`);
    }
  } catch (error) {
    console.log('Error updating currentUser', error);
  }
};

export const handleUpdateNames = async (
  email: Email | null,
  currentUserId: string | null,
  fieldName: keyof Names,
  value: string
) => {
  if (fieldName !== "nickname") {
    value = formatName(value);
  }
  handleUpdateCurrentUser(email, fieldName, value);
  handleUpdatePastPlayer(currentUserId, fieldName, value);
};

*/

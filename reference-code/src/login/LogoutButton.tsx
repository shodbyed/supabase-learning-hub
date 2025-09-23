// react
import { useContext } from "react";

// firebase
import { signOut } from "firebase/auth";
import { FirebaseContext } from "bca-firebase-queries";

// components
import { toast } from "react-toastify";

type LogOutProps = {
  buttonClass?: "small" | "text" | "default";
  disabled?: boolean;
};

export const LogoutButton = ({
  buttonClass = "default",
  disabled = false,
}: LogOutProps) => {
  const classString =
    buttonClass && buttonClass !== "default" ? `${buttonClass}-button` : "";
  const { auth } = useContext(FirebaseContext);

  const handleLogOut = async () => {
    if (auth) {
      try {
        await signOut(auth);
        toast.info("User logged out");
      } catch (error) {
        console.error("Error logging out", error);
      }
    }
  };

  return (
    <button className={classString} onClick={handleLogOut} disabled={disabled}>
      Log Out
    </button>
  );
};

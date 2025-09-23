import { useState } from "react";
import { InfoButton } from "../components/InfoButton";
import { CheckCity } from "./CheckCity";
import { SearchForPast } from "./SearchForPast";

type RetryFindPastProps = {
  setFetchId: React.Dispatch<React.SetStateAction<string | null | undefined>>;
  setFindPast: React.Dispatch<React.SetStateAction<boolean>>;
  findPast: boolean;
};

export const RetryFindPast = ({
  setFindPast,
  findPast,
}: RetryFindPastProps) => {
  const [checkedCity, setCheckedCity] = useState<"" | "failed" | "passed">("");

  const handleClick = () => {
    setFindPast(true);
    //setFetchId('');
    //setTriedBefore(true);
    //refetchPastPlayer();
  };

  return (
    <>
      {!findPast && (
        <div
          style={{
            display: "flex",
            width: "90%",
            gap: "10px",
            justifyContent: "end",
          }}
        >
          <InfoButton infoBlurbKey={"pastPlayer"} />
          <button onClick={handleClick}>I have played before</button>
        </div>
      )}
      {findPast && checkedCity === "" && (
        <div>
          <div className="confirm-title">
            We did not find any past data for your email.
          </div>
          <CheckCity
            setCheckedCity={setCheckedCity}
            setFindPast={setFindPast}
          />
        </div>
      )}
      {checkedCity === "passed" && (
        <SearchForPast
          setFindPast={setFindPast}
          setCheckedCity={setCheckedCity}
        />
      )}
    </>
  );
};

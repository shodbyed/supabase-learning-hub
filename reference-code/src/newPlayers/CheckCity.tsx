import { useState } from "react";

type CheckCityProps = {
  setCheckedCity: React.Dispatch<
    React.SetStateAction<"failed" | "passed" | "">
  >;
  setFindPast: React.Dispatch<React.SetStateAction<boolean>>;
};

export const CheckCity = ({ setCheckedCity, setFindPast }: CheckCityProps) => {
  // state
  const [enteredCity, setEnteredCity] = useState("");
  const [failedCityCheck, setFailedCityCheck] = useState(false);

  // handlers
  const handleClick = () => {
    const formatCity = enteredCity.trim().toLowerCase();
    if (
      formatCity === "moorpark" ||
      formatCity === "simi valley" ||
      formatCity === "simi"
    ) {
      setCheckedCity("passed");
    } else {
      setFailedCityCheck(true);
    }
  };

  const onFailed = () => {
    setCheckedCity("failed");
    setFindPast(false);
  };

  //render
  return (
    <>
      {!failedCityCheck && (
        <div>
          <div style={{ marginBottom: "15px" }}>
            What city was your Home team's pool hall located in?
          </div>
          <input
            className="edit-input"
            type="text"
            value={enteredCity}
            onChange={(e) => setEnteredCity(e.target.value)}
          />
          <div style={{ marginTop: "25px" }}>
            <button onClick={handleClick}>Check City</button>
          </div>
        </div>
      )}
      {failedCityCheck && (
        <div>
          <div>We have no records from any pool halls in {enteredCity}</div>
          <div>Click ok to go back to the BCA application form</div>
          <button onClick={onFailed}>Ok</button>
        </div>
      )}
    </>
  );
};

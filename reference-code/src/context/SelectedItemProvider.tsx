import { createContext, useState, useEffect } from "react";
import { Season } from "../assets/typesFolder/seasonTypes";
import { Team } from "bca-firebase-queries";

type SelectedItemContextType = {
  selectedSeason: Season | null;
  setSelectedSeason: (season: Season | null) => void;
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team | null) => void;
};

export const SelectedItemContext = createContext<SelectedItemContextType>({
  selectedSeason: null as Season | null,
  setSelectedSeason: () => {},
  selectedTeam: null as Team | null,
  setSelectedTeam: () => {},
});

export const SelectedItemProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // state
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(() => {
    const savedSeason = localStorage.getItem("selectedSeason");
    return savedSeason ? JSON.parse(savedSeason) : null;
  });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // useEffect
  useEffect(() => {
    localStorage.setItem("selectedSeason", JSON.stringify(selectedSeason));
  }, [selectedSeason]);

  useEffect(() => {
    setSelectedTeam(null);
  }, [selectedSeason]);

  return (
    <SelectedItemContext.Provider
      value={{
        selectedSeason,
        setSelectedSeason,
        selectedTeam,
        setSelectedTeam,
      }}
    >
      {children}
    </SelectedItemContext.Provider>
  );
};

import React, { useState, useEffect } from "react";
import { v4 as uuidV4 } from "uuid";
import { PastPlayer } from "bca-firebase-queries";

type PastPlayerSearchProps = {
  list: PastPlayer[];
  onSelect: (selectedPlayer: PastPlayer) => void;
};

export const PastPlayerSearch = ({ list, onSelect }: PastPlayerSearchProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<PastPlayer[]>(list);

  const listId = `dropdown-${uuidV4()}`;

  const getPlayerName = (player: PastPlayer) =>
    `${player.firstName} ${player.lastName}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const filtered = list.filter((player) =>
      getPlayerName(player).toLowerCase().includes(value.toLowerCase())
    );

    setFilteredItems(filtered);

    const selectedFullName = filtered.find(
      (player) => getPlayerName(player) === value
    );
    if (selectedFullName) {
      onSelect(selectedFullName);
    }
  };

  const handleSelect = (value: string) => {
    const selectedPlayer = list.find(
      (player) => getPlayerName(player) === value
    );
    if (selectedPlayer) onSelect(selectedPlayer);
  };

  useEffect(() => {
    if (!inputValue) setFilteredItems(list);
  }, [inputValue, list]);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <input
        list={listId}
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Start Typing Name..."
      />
      <button
        className="small-button"
        onClick={() => setInputValue("")}
        style={{ marginLeft: "5px" }}
      >
        Clear
      </button>
      <datalist id={listId}>
        {filteredItems.map((player) => (
          <option
            key={uuidV4()}
            value={getPlayerName(player)}
            onClick={() => handleSelect(getPlayerName(player))}
          />
        ))}
      </datalist>
    </div>
  );
};

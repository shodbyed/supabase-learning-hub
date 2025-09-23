import React, { useState, useEffect } from 'react';
import { v4 as uuidV4 } from 'uuid';
import './components.css';

type StringArraySearchProps = {
  list: string[];
  onSelect: (selectedItem: string) => void;
};

export const StringArraySearch = ({
  list,
  onSelect,
}: StringArraySearchProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<string[]>(list);
  const listId = `dropdown-${uuidV4()}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const filtered = list.filter(item =>
      item.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredItems(filtered);
  };

  const handleInputBlur = () => {
    // Check if the input value matches any item in the list
    if (list.includes(inputValue)) {
      onSelect(inputValue);
    }
  };

  useEffect(() => {
    if (!inputValue) setFilteredItems(list);
  }, [inputValue, list]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        className='dark-mode-input'
        list={listId}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder='Start Typing...'
      />
      <button onClick={() => setInputValue('')} style={{ marginLeft: '5px' }}>
        Clear
      </button>
      <datalist id={listId}>
        {filteredItems.map(item => (
          <option key={uuidV4()} value={item} />
        ))}
      </datalist>
    </div>
  );
};

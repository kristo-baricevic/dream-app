import { useState } from 'react';

const PersonalitySelection = ({ onSelect }: { onSelect: (personality: string) => void }) => {
  const [selectedPersonality, setSelectedPersonality] = useState('academic');

  const handleSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedPersonality(selected);
    onSelect(selected);
  };

  return (
    <div className="flex flex-col justify-center">
      <label htmlFor="personality" className="py-2">Choose your dream doctor&apos;s philosophy:  </label>
      <select id="personality" value={selectedPersonality} onChange={handleSelection} className="rounded-lg p-2 shadow-lg">
        <option value="academic">Academic</option>
        <option value="mystical">Mystical</option>
        <option value="scientific">Scientific</option>
        <option value="artistic">Artistic</option>
        <option value="compassionate">Compassionate</option>
      </select>
    </div>
  );
};

export default PersonalitySelection;

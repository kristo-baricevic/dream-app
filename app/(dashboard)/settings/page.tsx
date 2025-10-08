'use client';

import PersonalitySelection from '@/components/PersonalityDropdown';
import { RootState } from '@/redux/rootReducer';
import {
  addPhysical,
  addPsychological,
  removePsychological,
  removePhysical,
  setAstrologyField,
  setOccupation,
  setPersonality,
  setDoctorPersonality,
  setSettings,
} from '@/redux/slices/settingsSlice';
import { AppDispatch } from '@/redux/store';
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import DoctorSelection from '@/components/DoctorSelection';

type EditableFieldProps = {
  label: string;
  value: string;
  onSave: (value: string) => void;
};

const EditableField = ({ label, value, onSave }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1">
        <label className="text-xs text-gray-500 font-medium">{label}</label>
        {isEditing ? (
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div className="mt-1 text-gray-800 font-medium">{value || 'Not set'}</div>
        )}
      </div>

      {isEditing ? (
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <IconCheck size={18} />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <IconEdit size={18} />
        </button>
      )}
    </div>
  );
};

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);
  const [selectedPersonality, setSelectedPersonality] = useState('Academic');

  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
    dispatch(setDoctorPersonality(personality));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
      <p className="italic text-gray-500 mb-6">Note: Settings cannot be changed in demo mode.</p>

      {/* Personal Info Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Choose your doctor:</h2>
        <div className="grid gap-3">
          <div className="flex justify-center mb-4">
            <DoctorSelection
              selectedPersonality={selectedPersonality}
              onSelect={handlePersonalitySelect}
            />
          </div>
        </div>
      </div>

      {/* Astrology Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Astrology</h2>
        <div className="grid gap-3">
          <EditableField
            label="Sun Sign"
            value={settings.astrology.sun}
            onSave={(value) => dispatch(setAstrologyField({ field: 'sun', value }))}
          />
          <EditableField
            label="Moon Sign"
            value={settings.astrology.moon}
            onSave={(value) => dispatch(setAstrologyField({ field: 'moon', value }))}
          />
          <EditableField
            label="Rising Sign"
            value={settings.astrology.rising}
            onSave={(value) => dispatch(setAstrologyField({ field: 'rising', value }))}
          />
        </div>
      </div>

      {/* Personal Info Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Information</h2>
        <div className="grid gap-3">
          <EditableField
            label="Occupation"
            value={settings.occupation}
            onSave={(value) => dispatch(setOccupation(value))}
          />
          <EditableField
            label="Personality Type"
            value={settings.personality}
            onSave={(value) => dispatch(setPersonality(value))}
          />
        </div>
      </div>

      {/* Medical History Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Medical History</h2>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Psychological</h3>
          <div className="flex flex-wrap gap-2">
            {settings.medicalHistory.psychological.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full"
              >
                <span>{item}</span>
                <button
                  onClick={() => dispatch(removePsychological(index))}
                  className="hover:text-purple-900"
                >
                  <IconX size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const item = prompt('Add psychological condition:');
                if (item) dispatch(addPsychological(item));
              }}
              className="px-3 py-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 text-sm"
            >
              + Add
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Physical</h3>
          <div className="flex flex-wrap gap-2">
            {settings.medicalHistory.physical.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
              >
                <span>{item}</span>
                <button
                  onClick={() => dispatch(removePhysical(index))}
                  className="hover:text-blue-900"
                >
                  <IconX size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const item = prompt('Add physical condition:');
                if (item) dispatch(addPhysical(item));
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 text-sm"
            >
              + Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

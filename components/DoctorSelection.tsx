'use client';

import { RootState } from '@/redux/rootReducer';
import { setDoctorPersonality, setSettings, updateSettings } from '@/redux/slices/settingsSlice';
import { AppDispatch } from '@/redux/store';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';

type DoctorSelectionProps = {
  selectedPersonality: string;
};

const doctorImages: Record<string, string> = {
  Academic: '/owl_images/owl1.png',
  Mystical: '/owl_images/owl2.png',
  Artistic: '/owl_images/owl3.png',
  Compassionate: '/owl_images/owl4.png',
  Scientific: '/owl_images/owl5.png',
};

export default function DoctorSelection({ selectedPersonality }: DoctorSelectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const settings = useSelector((state: RootState) => state.settings);

  const doctors = [
    { label: 'Academic', src: '/owl_images/owl1.png' },
    { label: 'Mystical', src: '/owl_images/owl2.png' },
    { label: 'Artistic', src: '/owl_images/owl3.png' },
    { label: 'Compassionate', src: '/owl_images/owl4.png' },
    { label: 'Scientific', src: '/owl_images/owl5.png' },
  ];

  const handlePersonalitySelect = (personality: string) => {
    dispatch(setDoctorPersonality(personality));
    dispatch(setSettings({ ...settings, doctorPersonality: personality }));

    setTimeout(() => {
      dispatch(
        updateSettings({
          ...settings,
          doctorPersonality: personality,
          doctorImage: doctorImages[personality] || '',
        })
      );
    }, 0);
  };

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {doctors.map(({ label, src }) => (
        <div
          key={label}
          onClick={() => handlePersonalitySelect(label)}
          className={`cursor-pointer flex flex-col items-center rounded-xl border-4 transition-transform duration-150 ${
            selectedPersonality === label
              ? 'border-blue-500 scale-105 shadow-lg'
              : 'border-transparent hover:scale-105 hover:shadow-md'
          }`}
        >
          <Image src={src} alt={`${label} Owl`} height={150} width={150} className="rounded-lg" />
          <div className="mt-2 text-center text-gray-700 font-medium">{label}</div>
        </div>
      ))}
    </div>
  );
}

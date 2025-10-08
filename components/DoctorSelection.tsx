'use client';

import Image from 'next/image';

type DoctorSelectionProps = {
  selectedPersonality: string;
  onSelect: (personality: string) => void;
};

export default function DoctorSelection({ selectedPersonality, onSelect }: DoctorSelectionProps) {
  const doctors = [
    { label: 'Academic', src: '/owl_images/owl1.png' },
    { label: 'Mystical', src: '/owl_images/owl2.png' },
    { label: 'Artistic', src: '/owl_images/owl3.png' },
    { label: 'Compassionate', src: '/owl_images/owl4.png' },
    { label: 'Scientific', src: '/owl_images/owl5.png' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {doctors.map(({ label, src }) => (
        <div
          key={label}
          onClick={() => onSelect(label)}
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

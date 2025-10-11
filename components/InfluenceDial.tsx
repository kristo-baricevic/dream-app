const InfluenceDial = ({
  label,
  value,
  onChange,
  onChangeEnd,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onChangeEnd?: () => void;
}) => (
  <div className="flex items-center gap-3 mb-4">
    <label className="text-sm font-medium text-gray-700 w-32">{label}</label>
    <input
      type="range"
      min={0}
      max={1}
      step={0.1}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      onMouseUp={onChangeEnd}
      onTouchEnd={onChangeEnd}
      className="w-48 accent-blue-500"
    />
    <span className="text-sm text-gray-600 w-10">{value.toFixed(1)}</span>
  </div>
);

export default InfluenceDial;

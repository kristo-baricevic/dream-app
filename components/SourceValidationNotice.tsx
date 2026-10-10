export default function SourceValidationNotice({ status }: { status?: string }) {
  if (status !== 'historical_unvalidated') return null;
  return <p className="text-xs text-amber-900 bg-amber-50 rounded px-2 py-1" role="note">
    Historical interpretation — its sources and settings have not been validated.
  </p>;
}

export function formatAnalysis(text: string) {
  const parts = text?.split(/(Song suggestion:|Snack suggestion:)/);

  return parts?.map((part, i) => {
    if (part === 'Song suggestion:' || part === 'Snack suggestion:') {
      return (
        <span key={i}>
          <br /> <br />
          <strong>{part}</strong>
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

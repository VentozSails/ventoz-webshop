const SPEC_PATTERNS = [
  /^\s*(voorlijk|luff|vorliek)\s*[:：]\s*/i,
  /^\s*(achterlijk|leech|achterliek)\s*[:：]\s*/i,
  /^\s*(onderlijk|foot|boom|unterliek)\s*[:：]\s*/i,
  /^\s*(oppervlakte|sail\s*area|fläche|surface|superficie)\s*[:：]\s*/i,
  /^\s*(materiaal|material|matériau)\s*[:：]\s*/i,
  /^\s*(gewicht|weight|poids|gewicht\s*\(kg\))\s*[:：]\s*/i,
  /^\s*(inclusief|includes?|inclus|inklusive|einschließlich)\s*[:：]\s*/i,
  /^\s*(mast\s*(?:delen|sections?|teile)|mastdelen)\s*[:：]\s*/i,
  /^\s*(zeillatten|battens?|lattes?|segellatten)\s*[:：]\s*/i,
  /^\s*(mast(?:hoogte|lengte)|mast\s*(?:height|length))\s*[:：]\s*/i,
];

function isSpecLine(line: string): boolean {
  return SPEC_PATTERNS.some((re) => re.test(line));
}

function stripSpecLines(text: string): string {
  const lines = text.split("\n");
  const cleaned = lines.filter((line) => !isSpecLine(line));

  let result = cleaned.join("\n");
  result = result.replace(/\n{3,}/g, "\n\n").trim();
  return result;
}

interface FormattedDescriptionProps {
  text: string;
}

export default function FormattedDescription({ text }: FormattedDescriptionProps) {
  const cleanedText = stripSpecLines(text);
  if (!cleanedText) return null;

  const blocks = cleanedText.split(/\n\n+/);

  return (
    <div className="space-y-4">
      {blocks.map((block, bi) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const lines = trimmed.split("\n");

        const bulletLines = lines.filter((l) =>
          /^\s*[•\-\*]\s/.test(l)
        );
        if (bulletLines.length > 0 && bulletLines.length === lines.length) {
          return (
            <ul key={bi} className="space-y-1.5 ml-1">
              {lines.map((line, li) => (
                <li key={li} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="text-gold mt-0.5 shrink-0">&#8226;</span>
                  <span>{line.replace(/^\s*[•\-\*]\s*/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (bulletLines.length > 0) {
          const parts: { type: "p" | "ul"; content: string[] }[] = [];
          let currentBullets: string[] = [];
          let currentParagraph: string[] = [];

          for (const line of lines) {
            if (/^\s*[•\-\*]\s/.test(line)) {
              if (currentParagraph.length > 0) {
                parts.push({ type: "p", content: [...currentParagraph] });
                currentParagraph = [];
              }
              currentBullets.push(line.replace(/^\s*[•\-\*]\s*/, ""));
            } else {
              if (currentBullets.length > 0) {
                parts.push({ type: "ul", content: [...currentBullets] });
                currentBullets = [];
              }
              currentParagraph.push(line);
            }
          }
          if (currentBullets.length > 0) parts.push({ type: "ul", content: currentBullets });
          if (currentParagraph.length > 0) parts.push({ type: "p", content: currentParagraph });

          return (
            <div key={bi} className="space-y-2">
              {parts.map((part, pi) =>
                part.type === "ul" ? (
                  <ul key={pi} className="space-y-1.5 ml-1">
                    {part.content.map((item, ii) => (
                      <li key={ii} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                        <span className="text-gold mt-0.5 shrink-0">&#8226;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p key={pi} className="text-sm text-slate-600 leading-7">
                    {part.content.join(" ")}
                  </p>
                )
              )}
            </div>
          );
        }

        if (
          lines.length >= 2 &&
          lines[0].trim().length < 80 &&
          lines[0].trim().length < lines.slice(1).join(" ").length
        ) {
          return (
            <div key={bi}>
              <p className="text-sm font-semibold text-navy mb-1">{lines[0].trim()}</p>
              <p className="text-sm text-slate-600 leading-7">
                {lines.slice(1).join(" ")}
              </p>
            </div>
          );
        }

        return (
          <p key={bi} className="text-sm text-slate-600 leading-7">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

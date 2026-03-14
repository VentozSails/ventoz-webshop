export const SPEC_PATTERNS: [RegExp, string][] = [
  [/^\s*(?:voorlijk|luff|vorliek)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "luff"],
  [/^\s*(?:achterlijk|leech|achterliek)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "leech"],
  [/^\s*(?:onderlijk|foot|boom|unterliek)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "foot"],
  [/^\s*(?:oppervlakte|sail\s*area|fläche|surface|superficie|zeiloppervlak)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "sail_area"],
  [/^\s*(?:materiaal|material|matériau)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "materiaal"],
  [/^\s*(?:gewicht|weight|poids)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "gewicht"],
  [/^\s*(?:inclusief|includes?|inclus|inklusive|einschließlich)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "inclusief"],
  [/^\s*(?:mast\s*(?:delen|sections?|teile)|mastdelen)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "mastdelen"],
  [/^\s*(?:zeillatten|battens?|lattes?|segellatten)\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "zeillatten"],
  [/^\s*(?:mast(?:hoogte|lengte)|mast\s*(?:height|length))\s*(?:\([^)]*\)\s*)?[:：]\s*(.+)/i, "masthoogte"],
];

export function extractSpecsFromText(text: string): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    for (const [re, key] of SPEC_PATTERNS) {
      const m = line.match(re);
      if (m && m[1]) {
        specs[key] = m[1].trim();
        break;
      }
    }
  }
  return specs;
}

function isSpecLine(line: string): boolean {
  return SPEC_PATTERNS.some(([re]) => re.test(line));
}

function isDividerLine(line: string): boolean {
  return /^\s*[-–—]{3,}\s*$/.test(line);
}

function cleanDescription(text: string): string {
  const lines = text.split("\n");
  const cleaned = lines.filter((line) => !isSpecLine(line) && !isDividerLine(line));
  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

interface FormattedDescriptionProps {
  text: string;
}

export default function FormattedDescription({ text }: FormattedDescriptionProps) {
  const cleanedText = cleanDescription(text);
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

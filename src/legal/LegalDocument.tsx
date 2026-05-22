import { Box, Link, Typography } from "@mui/material";
import type { LegalBlock, LegalSection } from "@/legal/types";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/legal/constants";
import { miui } from "@/theme/theme";

function renderBlock(block: LegalBlock, key: number) {
  if (block.type === "paragraph") {
    return (
      <Typography key={key} component="p" className="legal-doc__paragraph">
        {formatContactInText(block.text)}
      </Typography>
    );
  }

  if (block.type === "list") {
    return (
      <Box key={key} component="ul" className="legal-doc__list">
        {block.items.map((item) => (
          <Box component="li" key={item}>
            <Typography component="span">{formatContactInText(item)}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box key={key} className="legal-doc__note">
      <Typography component="p">{formatContactInText(block.text)}</Typography>
    </Box>
  );
}

function formatContactInText(text: string) {
  if (!text.includes(CONTACT_EMAIL)) return text;
  const parts = text.split(CONTACT_EMAIL);
  return (
    <>
      {parts[0]}
      <Link href={CONTACT_MAILTO} className="legal-doc__link">
        {CONTACT_EMAIL}
      </Link>
      {parts[1]}
    </>
  );
}

function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <Box component="section" id={section.id} className="legal-doc__section">
      <Typography component="h2" className="legal-doc__heading">
        {section.title}
      </Typography>
      {section.blocks.map((block, i) => renderBlock(block, i))}
    </Box>
  );
}

type LegalDocumentProps = {
  sections: LegalSection[];
};

export function LegalDocument({ sections }: LegalDocumentProps) {
  return (
    <Box
      className="legal-doc"
      sx={{
        color: miui.textMuted,
        "& .legal-doc__link": {
          color: miui.text,
          textDecorationColor: miui.borderMid,
          "&:hover": { color: miui.accentStrong },
        },
      }}
    >
      {sections.map((section) => (
        <LegalSectionBlock key={section.id} section={section} />
      ))}
    </Box>
  );
}

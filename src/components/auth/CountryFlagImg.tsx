import { COUNTRY_OPTIONS, countryFlagSrc } from "@/utils/countryOptions";

type CountryFlagImgProps = {
  code: string;
  size?: number;
  className?: string;
};

/** Renders a country flag as PNG (reliable on Windows; emoji flags show as "IN", "US", etc.). */
export function CountryFlagImg({ code, size = 20, className }: CountryFlagImgProps) {
  const width = size;
  const height = Math.round(size * 0.72);

  return (
    <img
      src={countryFlagSrc(code, 40)}
      srcSet={`${countryFlagSrc(code, 80)} 2x`}
      width={width}
      height={height}
      alt=""
      aria-hidden
      className={className ?? "auth-country-flag-img"}
      loading="lazy"
      decoding="async"
    />
  );
}

export function countryCodeByName(name: string): string | undefined {
  return COUNTRY_OPTIONS.find((c) => c.name === name)?.code;
}

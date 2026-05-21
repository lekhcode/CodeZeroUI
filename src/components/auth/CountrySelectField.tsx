import { COUNTRY_OPTIONS } from "@/utils/countryOptions";
import { CountryFlagImg, countryCodeByName } from "./CountryFlagImg";

type CountrySelectFieldProps = {
  id: string;
  value: string;
  onChange: (countryName: string) => void;
  required?: boolean;
};

export function CountrySelectField({ id, value, onChange, required = true }: CountrySelectFieldProps) {
  const selectedCode = value ? countryCodeByName(value) : undefined;

  return (
    <div className="auth-field auth-field--country">
      <label htmlFor={id}>Country</label>
      <div className="auth-country-select-wrap">
        <span className="auth-country-select__flag" aria-hidden>
          {selectedCode ? (
            <CountryFlagImg code={selectedCode} size={20} />
          ) : (
            <span className="auth-country-select__globe">🌐</span>
          )}
        </span>
        <select
          id={id}
          className="auth-country-select"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Select country
          </option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

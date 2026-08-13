interface ColorFieldProps {
  color: string;
  label: string;
  onChange: (color: string) => void;
}

export function ColorField({ color, label, onChange }: ColorFieldProps) {
  return (
    <label className='palette-color-field'>
      <span>{label}</span>
      <span className='palette-color-field__control'>
        <input
          aria-label={label}
          type='color'
          value={color}
          onChange={event => onChange(event.target.value.toUpperCase())}
        />
        <code>{color}</code>
      </span>
    </label>
  );
}

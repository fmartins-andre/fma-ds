import { type Dispatch, Fragment, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/core/button/button";
import { Switch } from "@/core/switch/switch";
import {
  type EditableSetting,
  type HslAdjustment,
  NO_HSL_ADJUSTMENT,
  type Theme,
  type ThemeEditorAction,
  type ThemeMode,
  type ThemeShadow,
} from "@/lib/theme/index";
import { ColorField, Section, SliderField } from "./fields";

/** The theme settings this panel edits; see SETTINGS_COVERED in editor.tsx. */
export const OTHER_SETTINGS = ["radius", "spacing", "shadow"] as const satisfies EditableSetting[];
type OtherSetting = (typeof OTHER_SETTINGS)[number];

const DEFAULT_SHADOW: ThemeShadow = {
  color: "oklch(0 0 0)",
  opacity: 0.1,
  blur: "3px",
  spread: "0px",
  offsetX: "0px",
  offsetY: "1px",
};

// tweakcn's HSL presets, minus the arbitrary combined ones.
const HSL_PRESETS = [
  { id: "hueMinus60", hsl: { ...NO_HSL_ADJUSTMENT, hueShift: -60 } },
  { id: "huePlus60", hsl: { ...NO_HSL_ADJUSTMENT, hueShift: 60 } },
  { id: "huePlus120", hsl: { ...NO_HSL_ADJUSTMENT, hueShift: 120 } },
  { id: "invert", hsl: { ...NO_HSL_ADJUSTMENT, hueShift: 180 } },
  { id: "grayscale", hsl: { ...NO_HSL_ADJUSTMENT, saturationScale: 0 } },
  { id: "muted", hsl: { ...NO_HSL_ADJUSTMENT, saturationScale: 0.6 } },
  { id: "vibrant", hsl: { ...NO_HSL_ADJUSTMENT, saturationScale: 1.4 } },
  { id: "dimmer", hsl: { ...NO_HSL_ADJUSTMENT, lightnessScale: 0.9 } },
  { id: "brighter", hsl: { ...NO_HSL_ADJUSTMENT, lightnessScale: 1.1 } },
] as const satisfies { id: string; hsl: HslAdjustment }[];

const px = (value: string) => Number.parseFloat(value) || 0;
const rem = (value: string | undefined, fallback: number) =>
  value === undefined ? fallback : Number.parseFloat(value) || 0;

export function OtherPanel({
  theme,
  mode,
  hsl,
  edit,
  dispatch,
}: {
  theme: Theme;
  mode: ThemeMode;
  hsl: HslAdjustment;
  edit: (update: (theme: Theme) => Theme) => void;
  dispatch: Dispatch<ThemeEditorAction>;
}) {
  const { t } = useTranslation("themeEditor");
  const shadow = theme.shadow?.[mode];
  const setHsl = (next: HslAdjustment) => dispatch({ type: "hsl", hsl: next, at: Date.now() });

  // Color is per mode (dark shadows usually need more opacity or another
  // hue); geometry is shared, like tweakcn.
  const setShadow = (patch: Partial<ThemeShadow>) =>
    edit((current) => {
      const base = current.shadow ?? { light: DEFAULT_SHADOW, dark: DEFAULT_SHADOW };
      const { color, ...shared } = patch;
      return {
        ...current,
        shadow: {
          light: { ...base.light, ...shared, ...(mode === "light" && color && { color }) },
          dark: { ...base.dark, ...shared, ...(mode === "dark" && color && { color }) },
        },
      };
    });

  const sections: Record<OtherSetting, ReactNode> = {
    radius: (
      <Section title={t(($) => $.other.radius)}>
        <SliderField
          label="--radius"
          value={rem(theme.radius, 0.625)}
          min={0}
          max={2}
          step={0.025}
          unit="rem"
          onChange={(value) =>
            edit((current) => ({ ...current, radius: `${Number(value.toFixed(3))}rem` }))
          }
        />
      </Section>
    ),
    spacing: (
      <Section title={t(($) => $.other.spacing)}>
        <Toggle
          label={t(($) => $.other.customSpacing)}
          isSelected={theme.spacing !== undefined}
          onChange={(on) =>
            edit((current) => ({ ...current, spacing: on ? "0.25rem" : undefined }))
          }
        />
        {theme.spacing !== undefined && (
          <SliderField
            label="--spacing (p-1, gap-1…)"
            value={rem(theme.spacing, 0.25)}
            min={0.15}
            max={0.35}
            step={0.005}
            unit="rem"
            onChange={(value) =>
              edit((current) => ({ ...current, spacing: `${Number(value.toFixed(3))}rem` }))
            }
          />
        )}
      </Section>
    ),
    shadow: (
      <Section title={t(($) => $.other.shadow)}>
        <Toggle
          label={t(($) => $.other.customShadow)}
          isSelected={theme.shadow !== undefined}
          onChange={(on) =>
            edit((current) => ({
              ...current,
              shadow: on ? { light: DEFAULT_SHADOW, dark: DEFAULT_SHADOW } : undefined,
            }))
          }
        />
        {shadow && (
          <>
            <ColorField
              label={t(($) => $.other.color, { mode: t(($) => $.modes[mode]) })}
              value={shadow.color}
              onChange={(color) => setShadow({ color })}
              onChangeEnd={() => dispatch({ type: "checkpoint" })}
            />
            <SliderField
              label={t(($) => $.other.opacity)}
              value={shadow.opacity}
              min={0}
              max={1}
              step={0.01}
              onChange={(opacity) => setShadow({ opacity: Number(opacity.toFixed(2)) })}
            />
            <SliderField
              label={t(($) => $.other.blur)}
              value={px(shadow.blur)}
              min={0}
              max={50}
              step={0.5}
              unit="px"
              onChange={(value) => setShadow({ blur: `${value}px` })}
            />
            <SliderField
              label={t(($) => $.other.spread)}
              value={px(shadow.spread)}
              min={-50}
              max={50}
              step={0.5}
              unit="px"
              onChange={(value) => setShadow({ spread: `${value}px` })}
            />
            <SliderField
              label={t(($) => $.other.offsetX)}
              value={px(shadow.offsetX)}
              min={-50}
              max={50}
              step={0.5}
              unit="px"
              onChange={(value) => setShadow({ offsetX: `${value}px` })}
            />
            <SliderField
              label={t(($) => $.other.offsetY)}
              value={px(shadow.offsetY)}
              min={-50}
              max={50}
              step={0.5}
              unit="px"
              onChange={(value) => setShadow({ offsetY: `${value}px` })}
            />
          </>
        )}
      </Section>
    ),
  };
  return (
    <div className="flex flex-col gap-6">
      {OTHER_SETTINGS.map((setting) => (
        <Fragment key={setting}>{sections[setting]}</Fragment>
      ))}
      {/* An editing tool, not a theme setting: it rewrites the colors. */}
      <Section title={t(($) => $.other.hsl)}>
        <p className="text-xs text-muted-foreground">{t(($) => $.other.hslNote)}</p>
        <div className="flex flex-wrap gap-1.5">
          {HSL_PRESETS.map((preset) => (
            <Button key={preset.id} size="xs" variant="outline" onPress={() => setHsl(preset.hsl)}>
              {t(($) => $.other.presets[preset.id])}
            </Button>
          ))}
        </div>
        <SliderField
          label={t(($) => $.other.hue)}
          value={hsl.hueShift}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onChange={(hueShift) => setHsl({ ...hsl, hueShift })}
        />
        <SliderField
          label={t(($) => $.other.saturation)}
          value={hsl.saturationScale}
          min={0}
          max={2}
          step={0.01}
          unit="×"
          onChange={(saturationScale) => setHsl({ ...hsl, saturationScale })}
        />
        <SliderField
          label={t(($) => $.other.lightness)}
          value={hsl.lightnessScale}
          min={0.5}
          max={1.5}
          step={0.01}
          unit="×"
          onChange={(lightnessScale) => setHsl({ ...hsl, lightnessScale })}
        />
      </Section>
    </div>
  );
}

function Toggle({
  label,
  isSelected,
  onChange,
}: {
  label: string;
  isSelected: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch aria-label={label} isSelected={isSelected} onChange={onChange} />
      <span className="text-xs">{label}</span>
    </div>
  );
}

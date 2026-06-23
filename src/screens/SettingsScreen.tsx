import { useState } from 'preact/hooks'
import { Download, Upload, AlertCircle } from 'lucide-preact'
import { massUnit, volumeUnit, temperatureUnit, setMassUnit, setVolumeUnit, setTemperatureUnit, hapticsEnabled, setHapticsEnabled, autoTimersEnabled, setAutoTimersEnabled, notificationSoundsEnabled, setNotificationSoundsEnabled } from '../store/prefs'
import { themeMode, setThemeMode, type ThemeMode } from '../store/ui'
import { downloadExport, importData, pickImportFile } from '../db/export'

function SegmentedControl<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { label: string; value: T }[] }) {
  return (
    <div class="flex bg-[var(--bg-tertiary)]/50 rounded-full p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          class={`flex-1 px-3.5 py-1.5 rounded-full text-caption1 font-medium transition-all ${
            value === opt.value
              ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-tertiary)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function SettingsScreen() {
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleImport() {
    setImportMsg(null)
    const json = await pickImportFile()
    if (!json) return
    const result = importData(json)
    if (result.success) {
      setImportMsg({ type: 'success', text: 'Imported! Reloading…' })
      setTimeout(() => window.location.reload(), 800)
    } else {
      setImportMsg({ type: 'error', text: result.error ?? 'Import failed' })
    }
  }

  return (
    <div class="flex flex-col gap-8 p-4 pt-[calc(16px+var(--safe-top))] pb-24 relative">
      {/* Warm ambient */}
      <div class="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.04) 0%, transparent 50%)' }} />

      <h1 class="text-title1-bold font-display relative">Settings</h1>

      {/* Theme */}
      <section class="relative flex flex-col gap-3">
        <p class="text-caption1 text-[var(--text-tertiary)] uppercase tracking-wider">Appearance</p>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4">
          <div class="flex items-center justify-between">
            <span class="text-body">Theme</span>
            <SegmentedControl
              value={themeMode.value}
              onChange={setThemeMode}
              options={[
                { label: 'System', value: 'system' as ThemeMode },
                { label: 'Light', value: 'light' as ThemeMode },
                { label: 'Dark', value: 'dark' as ThemeMode },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Units */}
      <section class="relative flex flex-col gap-3">
        <p class="text-caption1 text-[var(--text-tertiary)] uppercase tracking-wider">Units</p>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] overflow-hidden">
          <UnitRow label="Mass" value={massUnit.value} onChange={setMassUnit}
            options={[{ label: 'grams', value: 'g' as const }, { label: 'ounces', value: 'oz' as const }]} />
          <UnitRow label="Volume" value={volumeUnit.value} onChange={setVolumeUnit}
            options={[{ label: 'ml', value: 'ml' as const }, { label: 'fl oz', value: 'floz' as const }]} last />
        </div>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] overflow-hidden">
          <UnitRow label="Temperature" value={temperatureUnit.value} onChange={setTemperatureUnit}
            options={[{ label: 'Celsius', value: 'celsius' as const }, { label: 'Fahrenheit', value: 'fahrenheit' as const }]} last />
        </div>
      </section>

      {/* Brewing */}
      <section class="relative flex flex-col gap-3">
        <p class="text-caption1 text-[var(--text-tertiary)] uppercase tracking-wider">Brewing</p>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] overflow-hidden">
          <ToggleRow label="Haptics" value={hapticsEnabled.value} onChange={setHapticsEnabled} />
          <ToggleRow label="Auto-start timers" value={autoTimersEnabled.value} onChange={setAutoTimersEnabled} />
          <ToggleRow label="Notification sounds" value={notificationSoundsEnabled.value} onChange={setNotificationSoundsEnabled} last />
        </div>
      </section>

      {/* Data */}
      <section class="relative flex flex-col gap-3">
        <p class="text-caption1 text-[var(--text-tertiary)] uppercase tracking-wider">Data</p>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] overflow-hidden">
          <button
            onClick={downloadExport}
            class="flex items-center gap-3 px-4 py-3.5 w-full text-body active:bg-[var(--bg-tertiary)]/30 transition-colors border-b border-[var(--color-separator)]"
          >
            <Download size={18} strokeWidth={2} class="text-[var(--color-caramel)]" />
            <span>Export backup</span>
            <span class="ml-auto text-caption1 text-[var(--text-tertiary)]">.json</span>
          </button>
          <button
            onClick={handleImport}
            class="flex items-center gap-3 px-4 py-3.5 w-full text-body active:bg-[var(--bg-tertiary)]/30 transition-colors"
          >
            <Upload size={18} strokeWidth={2} class="text-[var(--color-caramel)]" />
            <span>Import backup</span>
          </button>
        </div>
        {importMsg && (
          <div class={`flex items-center gap-2 text-caption1 px-1 ${importMsg.type === 'error' ? 'text-[var(--color-red)]' : 'text-[var(--color-green)]'}`}>
            <AlertCircle size={14} strokeWidth={2} />
            <span>{importMsg.text}</span>
          </div>
        )}
      </section>
    </div>
  )
}

function UnitRow<T extends string>({ label, value, onChange, options, last }: {
  label: string; value: T; onChange: (v: T) => void; options: { label: string; value: T }[]; last?: boolean
}) {
  return (
    <div class={`flex items-center justify-between px-4 py-3 ${last ? '' : 'border-b border-[var(--color-separator)]'}`}>
      <span class="text-body">{label}</span>
      <div class="flex bg-[var(--bg-tertiary)]/50 rounded-full p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            class={`px-3 py-1 rounded-full text-caption1 font-medium transition-all ${
              value === opt.value
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-tertiary)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ToggleRow({ label, value, onChange, last }: { label: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <div class={`flex items-center justify-between px-4 py-3 ${last ? '' : 'border-b border-[var(--color-separator)]'}`}>
      <span class="text-body">{label}</span>
      <button
        onClick={() => onChange(!value)}
        class={`w-11 h-6 rounded-full transition-colors relative ${
          value ? 'bg-[var(--color-caramel)]' : 'bg-[var(--bg-tertiary)]'
        }`}
      >
        <div class={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          value ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  )
}

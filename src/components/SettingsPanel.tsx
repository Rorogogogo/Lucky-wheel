import { useState, useRef, useEffect } from 'react';
import { type LuckyWheelData } from '../hooks/useLuckyWheel';
import { RefreshCcw, LayoutTemplate, Pencil } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsPanelProps {
  data: LuckyWheelData;
  setActivePresetId: (id: string) => void;
  updatePresetName: (id: string, name: string) => void;
  revertToDefaults: () => void;
  disabled: boolean;
}

export function SettingsPanel({
  data,
  setActivePresetId,
  updatePresetName,
  revertToDefaults,
  disabled,
}: SettingsPanelProps) {
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPresetId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingPresetId]);

  const startEditing = (id: string, name: string) => {
    setEditingPresetId(id);
    setEditingName(name);
  };

  const commitEdit = () => {
    if (editingPresetId && editingName.trim()) {
      updatePresetName(editingPresetId, editingName.trim());
    }
    setEditingPresetId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Presets */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <LayoutTemplate size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-800">Presets</h3>
          <span className="text-xs text-slate-400 ml-1">— click name to rename</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {data.presets.map((preset) => {
            const isActive = data.activePresetId === preset.id;
            const isEditing = editingPresetId === preset.id;

            return (
              <div key={preset.id} className="relative group/preset">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit();
                      if (e.key === 'Escape') setEditingPresetId(null);
                    }}
                    className="w-full py-2 px-3 rounded-lg text-sm font-medium border border-primary ring-2 ring-primary/30 outline-none bg-white text-slate-800 text-center"
                  />
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (!isActive) setActivePresetId(preset.id);
                      }}
                      disabled={disabled}
                      className={cn(
                        "w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 border text-center break-words leading-tight pr-6",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      )}
                    >
                      {preset.name}
                    </button>
                    {/* Pencil edit icon — visible on hover */}
                    {!disabled && (
                      <button
                        onClick={() => {
                          if (!isActive) setActivePresetId(preset.id);
                          startEditing(preset.id, preset.name);
                        }}
                        className={cn(
                          "absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded transition-all",
                          isActive
                            ? "text-white/70 hover:text-white opacity-0 group-hover/preset:opacity-100"
                            : "text-slate-400 hover:text-primary opacity-0 group-hover/preset:opacity-100"
                        )}
                        title="Rename"
                      >
                        <Pencil size={11} />
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="mt-auto flex justify-end">
        <button
          onClick={() => {
            if (window.confirm("Reset all presets to default? This cannot be undone.")) {
              revertToDefaults();
            }
          }}
          disabled={disabled}
          className="text-xs text-slate-400 hover:text-slate-600 flex gap-1 items-center transition-colors"
        >
          <RefreshCcw size={12} />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

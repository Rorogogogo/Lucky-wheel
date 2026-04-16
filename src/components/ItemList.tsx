import { type WheelItem } from '../hooks/useLuckyWheel';
import { cn } from '../lib/utils';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ItemListProps {
  items: WheelItem[];
  onChange: (items: WheelItem[]) => void;
  disabled: boolean;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6', '#0ea5e9', '#8b5cf6',
];

interface SortableItemProps {
  item: WheelItem;
  disabled: boolean;
  onUpdate: (id: string, partial: Partial<WheelItem>) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ item, disabled, onUpdate, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 p-2 bg-white rounded-lg border border-border shadow-sm mb-2 group',
        isDragging && 'shadow-md opacity-90 ring-1 ring-primary',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={16} />
      </div>

      {/* Color Picker */}
      <div className="relative">
        <input
          type="color"
          value={item.color}
          onChange={(e) => onUpdate(item.id, { color: e.target.value })}
          className="w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden opacity-0 absolute inset-0"
        />
        <div
          className="w-6 h-6 rounded border border-black/10 mx-1 cursor-pointer pointer-events-none"
          style={{ backgroundColor: item.color }}
        />
      </div>

      <input
        type="text"
        value={item.label}
        onChange={(e) => onUpdate(item.id, { label: e.target.value })}
        className="flex-1 min-w-0 bg-transparent border-none outline-none focus:ring-1 focus:ring-ring rounded px-2 text-sm"
        placeholder="Item label"
        disabled={disabled}
      />

      <button
        onClick={() => onDelete(item.id)}
        disabled={disabled}
        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        aria-label="Delete item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export function ItemList({ items, onChange, disabled }: ItemListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleUpdate = (id: string, partial: Partial<WheelItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...partial } : i)));
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const handleAdd = () => {
    const color = PRESET_COLORS[items.length % PRESET_COLORS.length];
    onChange([...items, { id: crypto.randomUUID(), label: `Item ${items.length + 1}`, color }]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-xl">
        <h3 className="font-semibold text-slate-800">Wheel Items</h3>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
          {items.length} items
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                disabled={disabled}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <div className="text-center p-6 text-slate-400 text-sm">
            List is empty. Add items to spin!
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
        <button
          onClick={handleAdd}
          disabled={disabled}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>
    </div>
  );
}

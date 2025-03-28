import { TAGS, TagType } from '../lib/constants/tags';

interface TagSelectorProps {
  selectedTags: TagType[];
  onTagToggle: (tag: TagType) => void;
}

function TagSelector({ selectedTags, onTagToggle }: TagSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(TAGS).map(([tagKey, tagData]) => (
        <button
          key={tagKey}
          onClick={() => onTagToggle(tagKey as TagType)}
          className={`px-2 py-1 rounded-full text-xs border transition-colors ${
            selectedTags.includes(tagKey as TagType)
              ? `${tagData.color} ${tagData.borderColor}`
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
          }`}
        >
          {tagData.label}
        </button>
      ))}
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { CustomTag } from '../lib/types/tags';
import { Trash2, AlertTriangle } from 'lucide-react';

const COLOR_OPTIONS = [
  { label: 'Red', value: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Blue', value: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Green', value: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Yellow', value: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'Purple', value: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Pink', value: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: 'Indigo', value: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { label: 'Gray', value: 'bg-gray-100 text-gray-700 border-gray-200' },
];

interface TagEditorProps {
  onSave: (tag: CustomTag, noteId: string) => void;
  onDelete?: (tagId: string) => void;
  onClose: () => void;
  existingTag?: CustomTag;
  editingNoteId: string;
  affectedNotesCount?: number;
}

export default function TagEditor({
  onSave,
  onDelete,
  onClose,
  editingNoteId,
  existingTag,
  affectedNotesCount = 0,
}: TagEditorProps) {
  const [tagName, setTagName] = useState(existingTag?.name || '');
  const [selectedColor, setSelectedColor] = useState(existingTag?.color || COLOR_OPTIONS[0].value);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    if (!tagName.trim()) return;

    onSave(
      {
        id: existingTag?.id || Date.now().toString(),
        name: tagName.trim(),
        color: selectedColor,
        checked: true,
      },
      editingNoteId
    );
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (existingTag && onDelete) {
      onDelete(existingTag.id);
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='p-6 bg-white rounded-lg shadow-xl max-w-md w-full mx-4'>
        {showDeleteConfirm ? (
          <div className='space-y-4'>
            <div className='flex items-center gap-2 text-red-600'>
              <AlertTriangle className='w-5 h-5' />
              <h3 className='text-lg font-semibold'>Delete Tag</h3>
            </div>
            <div className='space-y-2'>
              <p className='text-gray-600'>Are you sure you want to delete &quot;{existingTag?.name}&quot;?</p>
              <p className='text-sm text-red-600'>
                This will remove the tag from{' '}
                <span className='font-semibold'>
                  {affectedNotesCount} {affectedNotesCount === 1 ? 'note' : 'notes'}
                </span>
                .
              </p>
            </div>
            <div className='flex justify-end gap-2 pt-4'>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600'
              >
                Delete Tag
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-black'>{existingTag ? 'Edit Tag' : 'Create New Tag'}</h3>
              {existingTag && onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className='p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              )}
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Tag Name</label>
                <input
                  type='text'
                  value={tagName}
                  maxLength={16}
                  onChange={(e) => setTagName(e.target.value)}
                  className='w-full px-3 py-2 border text-black rounded-md focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter tag name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Color</label>
                <div className='grid grid-cols-4 gap-2'>
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`p-2 rounded-md border transition-colors ${color.value} ${
                        selectedColor === color.value ? 'outline-dashed outline-1 outline-orange-700' : ''
                      }`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className='flex justify-end gap-2 pt-4'>
                <button onClick={onClose} className='px-4 py-2 text-gray-600 hover:text-gray-800'>
                  Cancel
                </button>
                <button onClick={handleSave} className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'>
                  {existingTag ? 'Save Changes' : 'Create Tag'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

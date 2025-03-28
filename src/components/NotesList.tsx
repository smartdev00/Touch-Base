'use client';

import React, { useEffect, useState } from 'react';
import { getDocuments, updateDocument, deleteDocument } from '../lib/firebase/firebaseUtils';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, addDays, subDays, isAfter } from 'date-fns';
import {
  Pencil,
  Check,
  X,
  Trash2,
  Search,
  SortDesc,
  SortAsc,
  Calendar,
  FileUp,
  Loader2,
  ExternalLink,
  CheckIcon,
} from 'lucide-react';
import { processTranscription } from '../lib/helpers/processTranscription';
import { exportToGoogleSheets } from '../lib/helpers/googleSheets';
import GoogleSheetsSetup from './GoogleSheetsSetup';
import { CustomTag } from '../lib/types/tags';
import TagEditor from './TagEditor';
import { useGoogleAuth } from '@/lib/contexts/GoogleAuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button, { ItemButton } from './Button';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  location: string;
  names: string[];
  nature: string;
  followupDate: string | null;
  tags: CustomTag[];
}

interface DateRange {
  start: string | null;
  end: string | null;
}

type QuickFilter = 'today' | 'yesterday' | '7days' | '14days' | '30days' | 'custom';
const dateFilter: { type: QuickFilter; text: string }[] = [
  { type: 'today', text: 'Today' },
  { type: 'yesterday', text: 'Yesterday' },
  { type: '7days', text: 'Last 7 Days' },
  { type: '14days', text: 'Last 14 Days' },
  { type: '30days', text: 'Last 30 Days' },
];

export default function NotesList() {
  const { userInfor, setUserInfor } = useGoogleAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New states for search and sort
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('custom');

  // Add a new state for tracking which note is being exported
  const [exportingId, setExportingId] = useState<string | null>(null);

  // Add state for managing tags
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [showTagEditor, setShowTagEditor] = useState(false);

  // Add new state for tag filtering
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Add new states
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  // Add
  const [editingNoteId, setEditingNoteId] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    const tempTags: string[] = [];
    const fetchNotes = async () => {
      const fetchedNotes = await getDocuments('notes');
      const typedNotes = fetchedNotes?.map((doc) => {
        if ((doc as any)?.tags?.length > 0) {
          (doc as any).tags.map((tag: CustomTag) => {
            !tempTags.includes(tag?.name) && tempTags.push(tag?.name);
          });
        }
        return {
          id: doc.id,
          text: (doc as any).text || '',
          timestamp: (doc as any).timestamp || new Date().toISOString(),
          tags: (doc as any).tags || [],
        };
      }) as Note[];

      setAllTags(tempTags);
      setNotes(typedNotes?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };

    fetchNotes();
  }, []);

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const handleSave = async (noteId: string) => {
    setIsUpdating(true);
    try {
      await updateDocument('notes', noteId, { text: editText.trim() });

      // Update local state
      setNotes(notes?.map((note) => (note.id === noteId ? { ...note, text: editText.trim() } : note)));

      setEditingId(null);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteDocument('notes', noteId);
      setNotes(notes?.filter((note) => note.id !== noteId));
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  // Filter and sort notes
  const filteredAndSortedNotes = React.useMemo(() => {
    let filtered = [...notes];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((note) => note.text.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Apply tag filters
    if (selectedTagFilters.length > 0) {
      filtered = filtered.filter((note) => note.tags?.some((tag) => selectedTagFilters.includes(tag.name)));
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((note) => {
        const noteDate = parseISO(note.timestamp);
        const start = dateRange.start ? startOfDay(parseISO(dateRange.start)) : null;
        const end = dateRange.end ? endOfDay(parseISO(dateRange.end)) : null;

        if (start && end) {
          return isWithinInterval(noteDate, { start, end });
        } else if (start) {
          return noteDate >= start;
        } else if (end) {
          return noteDate <= end;
        }
        return true;
      });
    }

    // Apply sort order
    return filtered.sort((a, b) => {
      const comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortOrder === 'newest' ? comparison : -comparison;
    });
  }, [notes, searchQuery, dateRange, sortOrder, selectedTagFilters]);

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
  };

  const handleQuickFilter = (filter: QuickFilter) => {
    if (filter === quickFilter) {
      setQuickFilter('custom');
      setDateRange({ start: null, end: null });
      return;
    }
    const today = new Date();
    setQuickFilter(filter);

    switch (filter) {
      case 'today':
        setDateRange({
          start: startOfDay(today).toISOString().split('T')[0],
          end: endOfDay(today).toISOString().split('T')[0],
        });
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({
          start: startOfDay(yesterday).toISOString().split('T')[0],
          end: endOfDay(yesterday).toISOString().split('T')[0],
        });
        break;
      case '7days':
        setDateRange({
          start: subDays(today, 7).toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      case '14days':
        setDateRange({
          start: subDays(today, 14).toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      case '30days':
        setDateRange({
          start: subDays(today, 30).toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      default:
        break;
    }
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setQuickFilter('custom');

    if (type === 'start' && dateRange.end && isAfter(new Date(value), new Date(dateRange.end))) {
      alert('Start date cannot be after end date');
      return;
    }

    if (type === 'end' && dateRange.start && isAfter(new Date(dateRange.start), new Date(value))) {
      alert('End date cannot be before start date');
      return;
    }

    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  // Add the export handler
  const handleExport = async (note: Note) => {
    try {
      if (!userInfor) {
        router.push('/signin');
        return;
      }
      if (!userInfor?.openaiKey) {
        alert('Input the openai key.');
        return;
      }
      console.log('userInfor', userInfor);
      console.log('Exporting note : ', note);
      setExportingId(note.id);

      // Process with OpenAI
      const processedData = await processTranscription(note.text, note.timestamp, userInfor?.openaiKey);
      console.log('ProcessedData: ', processedData);

      if (!userInfor?.sheetId) {
        alert('Create Goolge Sheet at first!');
        return;
      }
      // Export to Google Sheets
      await exportToGoogleSheets(processedData, userInfor?.sheetId);

      const tempNotes = userInfor?.notes || [];
      const tempUser = { ...userInfor, notes: [...tempNotes, note.id] };
      await updateDocument('user', userInfor.id, tempUser);
      setUserInfor(tempUser);
      localStorage.setItem('userInfor', JSON.stringify(tempUser));

      alert('Note exported successfully!');
    } catch (error) {
      console.error('Failed to export note:', error);
    } finally {
      setExportingId(null);
    }
  };

  const handleAddTag = async (tag: CustomTag, noteId: string) => {
    try {
      if (notes?.find((note) => note.id === noteId)?.tags.some((noteTag) => noteTag.name === tag.name)) {
      } else {
        const updateNotes = notes?.map((note) => (note.id === noteId ? { ...note, tags: [...note.tags, tag] } : note));
        setNotes(updateNotes);
        setCustomTags((prev) => [...prev, tag]);
        const updateNoteTags = updateNotes?.find((uNote) => uNote.id === noteId)?.tags || [];
        await updateDocument('notes', noteId, { tags: [...updateNoteTags] });
        setShowTagEditor(false);
        setEditingTagId(null);
      }
    } catch (error) {
      console.error('Error adding note tag:', error);
      alert('Failed to add tag. Please try again.');
    }
  };

  // Add tag filter toggle handler
  const handleTagFilter = (tag: string) => {
    setSelectedTagFilters((prev) => (prev.includes(tag) ? prev.filter((id) => id !== tag) : [...prev, tag]));
  };

  // Add handler for updating note tags
  const handleUpdateNoteTags = async (noteId: string, tags: CustomTag[]) => {
    try {
      await updateDocument('notes', noteId, { tags });
      setNotes(notes?.map((note) => (note.id === noteId ? { ...note, tags } : note)));
    } catch (error) {
      console.error('Error updating note tags:', error);
      alert('Failed to update tags. Please try again.');
    }
  };

  // Add handlers for tag management
  const handleEditTag = (tag: CustomTag) => {
    setEditingTagId(tag.id);
    setShowTagEditor(true);
  };

  const handleUpdateTag = (updatedTag: CustomTag, noteId: string) => {
    setCustomTags((prev) => prev.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)));

    // Update all notes that use this tag
    setNotes((prev) =>
      prev.map((note) => ({
        ...note,
        tags: note.tags?.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)) || [],
      }))
    );
  };

  const handleDeleteTag = async (tagId: string) => {
    // Remove tag from all notes
    const updatedNotes = notes?.map((note) => ({
      ...note,
      tags: note.tags?.filter((tag) => tag.id !== tagId) || [],
    }));

    setNotes(updatedNotes);
    setCustomTags((prev) => prev.filter((tag) => tag.id !== tagId));
    setShowTagEditor(false);
  };

  return (
    <div className='w-full mt-8 text-dark'>
      <div className='mb-6'>
        <GoogleSheetsSetup />
      </div>
      <div className='mb-6 space-y-4'>
        {/* Search Bar */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search notes...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800'
            autoComplete='off'
          />
        </div>

        {/* Sort Toggle */}
        <Button
          onClick={handleSortToggle}
          className='flex items-center gap-2 py-1 px-3 border hover:text-black transition-colors'
        >
          {sortOrder === 'newest' ? (
            <>
              <SortDesc className='w-4 h-4' />
              Newest First
            </>
          ) : (
            <>
              <SortAsc className='w-4 h-4' />
              Oldest First
            </>
          )}
        </Button>

        {/* Date Range Picker */}
        <div className='flex flex-col gap-4'>
          {/* Quick Filters */}
          <div className='flex gap-2 flex-wrap'>
            {dateFilter.map((dFilter) => {
              return (
                <ItemButton
                  onClick={() => handleQuickFilter(dFilter.type)}
                  key={dFilter.type}
                  className={` ${
                    quickFilter === dFilter.type
                      ? 'bg-dark text-white hover:bg-slate-600'
                      : 'text-dark hover:bg-gray-300 bg-transparent'
                  }`}
                >
                  {dFilter.text}
                </ItemButton>
              );
            })}
          </div>

          {/* Date Range Picker (update the onChange handlers) */}
          <div className='relative flex items-center justify-start gap-1 sm:gap-2 bg-white rounded-lg border p-2 min-w-[310px]'>
            <Calendar className='w-4 h-4 text-gray-400' />
            <span className='text-gray-400 xs:block hidden'>from</span>
            <input
              type='date'
              value={dateRange.start || ''}
              onChange={(e) => handleDateChange('start', e.target.value)}
              onReset={() => setDateRange({ ...dateRange, start: null })}
              className='border-0 text-sm focus:ring-0 text-gray-800'
            />
            <Calendar className='w-4 h-4 text-gray-400' />
            <span className='text-gray-400 xs:block hidden'>to</span>
            <input
              type='date'
              value={dateRange.end || ''}
              onChange={(e) => handleDateChange('end', e.target.value)}
              onReset={() => setDateRange({ ...dateRange, end: null })}
              className='border-0 text-sm focus:ring-0 text-gray-800'
            />
            <button
              className='text-dark px-2 text-sm border border-dark rounded-lg right-2 absolute'
              onClick={() => setDateRange({ start: null, end: null })}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tag filter */}
        <div className='flex gap-2 flex-wrap'>
          {allTags.map((tag) => {
            return (
              <ItemButton
                key={tag}
                onClick={() => handleTagFilter(tag)}
                className={`${
                  selectedTagFilters.includes(tag)
                    ? 'bg-dark text-white hover:bg-slate-600'
                    : 'text-dark hover:bg-gray-300 bg-transparent'
                }`}
              >
                {tag}
              </ItemButton>
            );
          })}
        </div>
      </div>

      <h2 className='text-2xl font-semibold mb-4'>Your Notes</h2>
      <div className='space-y-4'>
        {filteredAndSortedNotes?.map((note) => (
          <div key={note.id} className='p-4 bg-white rounded-lg shadow relative'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                <p className='text-sm text-dark'>{format(new Date(note.timestamp), 'MMM d, yyyy h:mm a')}</p>
                {/* <div className="mt-1 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {note.nature}
                  </span>
                  {note.location !== 'Not specified' && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      📍 {note.location}
                    </span>
                  )}
                  {note.followupDate && (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                      📅 Follow-up: {format(new Date(note.followupDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div> */}
                {note.names?.length > 0 && (
                  <div className='mt-1 flex gap-1'>
                    {note.names.map((name, i) => (
                      <span key={i} className='text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full'>
                        👤 {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className='flex items-center gap-2'>
                {editingId !== note.id && (
                  <>
                    <button
                      onClick={() => handleEdit(note)}
                      className='text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => setDeletingId(note.id)}
                      className='text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleExport(note)}
                      disabled={exportingId === note.id || userInfor?.notes?.some((nId: string) => nId === note.id)}
                      className={`text-green-500 hover:text-green-600 p-1 rounded-full hover:bg-green-50 ${
                        exportingId === note.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {exportingId === note.id ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : userInfor?.notes?.some((nId: string) => nId === note.id) ? (
                        <Link href={`https://docs.google.com/spreadsheets/d/${userInfor.sheetId}`} target='_blank'>
                          <ExternalLink className='w-4 h-4' />
                        </Link>
                      ) : (
                        <FileUp className='w-4 h-4' />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {deletingId === note.id && (
              <div className='mt-2 p-3 bg-red-50 rounded-lg'>
                <p className='text-sm text-red-800 mb-2'>Are you sure you want to delete this note?</p>
                <div className='flex justify-end gap-2'>
                  <button
                    onClick={() => setDeletingId(null)}
                    className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1'
                  >
                    <X className='w-4 h-4' />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className='px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1'
                  >
                    <Trash2 className='w-4 h-4' />
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Existing edit form */}
            {editingId === note.id ? (
              <div className='space-y-3'>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800'
                  rows={4}
                  disabled={isUpdating}
                />
                <div className='flex justify-end gap-2'>
                  <button
                    onClick={() => handleCancel()}
                    className='px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1'
                    disabled={isUpdating}
                  >
                    <X className='w-4 h-4' />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(note.id)}
                    className='px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-1 disabled:opacity-50'
                    disabled={isUpdating}
                  >
                    <Check className='w-4 h-4' />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className='text-gray-800'>{note.text}</p>
            )}

            {/* Add this to the note card UI */}
            <div className='mt-2'>
              <div className='flex gap-1 items-center'>
                <label className='block text-xs text-dark mb-1'>Tags</label>
                {/* Add this where you want the tag editor button to appear */}
                <button
                  onClick={() => {
                    setEditingNoteId(note.id);
                    setEditingTagId(null);
                    setShowTagEditor(true);
                  }}
                  className='w-7 h-7 text-sm border rounded-full hover:bg-gray-50'
                >
                  +
                </button>
              </div>

              <div className='flex flex-wrap gap-1 mt-1'>
                {note.tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      const currentTags = note.tags;
                      currentTags.map((currentTag) => {
                        if (currentTag.id === tag.id) currentTag.checked = currentTag.checked ? false : true;
                      });
                      handleUpdateNoteTags(note.id, currentTags);
                    }}
                    className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                      tag.checked ? tag.color : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
            {userInfor?.notes?.some((nId: string) => nId === note.id) && (
              <CheckIcon className='absolute right-4 bottom-3 text-white stroke-[3] w-10 h-10 bg-dark-green rounded-full p-2 bg-opacity-40' />
            )}
          </div>
        ))}
      </div>

      {showTagEditor && (
        <TagEditor
          onSave={editingTagId ? handleUpdateTag : handleAddTag}
          onDelete={editingTagId ? handleDeleteTag : undefined}
          onClose={() => {
            setShowTagEditor(false);
            setEditingTagId(null);
          }}
          existingTag={editingTagId ? customTags.find((t) => t.id === editingTagId) : undefined}
          editingNoteId={editingNoteId}
          affectedNotesCount={
            editingTagId ? notes?.filter((note) => note.tags?.some((tag) => tag.id === editingTagId)).length : 0
          }
        />
      )}
    </div>
  );
}

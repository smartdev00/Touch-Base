export const TAGS = {
  URGENT: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700',
    borderColor: 'border-red-200',
  },
  FOLLOWUP: {
    label: 'Follow Up',
    color: 'bg-yellow-100 text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700',
    borderColor: 'border-green-200',
  },
  PENDING: {
    label: 'Pending',
    color: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-200',
  },
  PERSONAL: {
    label: 'Personal',
    color: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-200',
  },
  WORK: {
    label: 'Work',
    color: 'bg-indigo-100 text-indigo-700',
    borderColor: 'border-indigo-200',
  },
  // Add more tags as needed
};

export type TagType = keyof typeof TAGS; 
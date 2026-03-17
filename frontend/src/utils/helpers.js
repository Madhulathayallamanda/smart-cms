import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy, hh:mm a');
export const formatDateShort = (date) => format(new Date(date), 'dd MMM yyyy');
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const getStatusBadgeClass = (status) => {
  const map = {
    'Submitted': 'badge-submitted',
    'Accepted': 'badge-accepted',
    'Under Investigation': 'badge-investigation',
    'Resolved': 'badge-resolved',
    'Rejected': 'badge-rejected',
    'Closed': 'badge-rejected',
  };
  return map[status] || 'badge-submitted';
};

export const getStatusDotClass = (status) => {
  const map = {
    'Submitted': 'dot-submitted',
    'Accepted': 'dot-accepted',
    'Under Investigation': 'dot-investigation',
    'Resolved': 'dot-resolved',
    'Rejected': 'dot-rejected',
  };
  return map[status] || 'dot-submitted';
};

export const getPriorityColor = (priority) => {
  const map = { Low: '#34d399', Medium: '#fbbf24', High: '#f97316', Critical: '#f87171' };
  return map[priority] || '#94a3b8';
};

export const getCategoryIcon = (category) => {
  const map = {
    'Theft': '🔓', 'Assault': '⚠️', 'Fraud': '💳', 'Cybercrime': '💻',
    'Accident': '🚗', 'Missing Person': '👤', 'Domestic Violence': '🏠',
    'Drug Related': '💊', 'Property Damage': '🏗️', 'Public Nuisance': '📢',
    'Corruption': '⚖️', 'Other': '📋'
  };
  return map[category] || '📋';
};

export const COMPLAINT_CATEGORIES = [
  'Theft', 'Assault', 'Fraud', 'Cybercrime', 'Accident',
  'Missing Person', 'Domestic Violence', 'Drug Related',
  'Property Damage', 'Public Nuisance', 'Corruption', 'Other'
];

export const COMPLAINT_STATUSES = ['Submitted', 'Accepted', 'Under Investigation', 'Resolved', 'Rejected'];

export const truncate = (str, n = 80) => str?.length > n ? str.slice(0, n) + '...' : str;

import axios from 'axios';

const MESSAGES = {
  400: 'The request is invalid. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource could not be found.',
  409: 'This record already exists. Please use a different value.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'Something went wrong on our end. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
  504: 'The service took too long to respond. Please try again later.',
};

const DEFAULT_MESSAGE = 'Unexpected error. Please try again later.';

const VALIDATION_STATUSES = new Set([400, 422]);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stringifyFieldMap(map) {
  const fields = {};

  Object.entries(map).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) fields[key] = value[0];
    } else if (isObject(value)) {
      const msg = value.message || value.msg || value.description;
      if (msg) fields[key] = msg;
    } else if (value !== undefined && value !== null && value !== '') {
      fields[key] = String(value);
    }
  });

  return Object.keys(fields).length > 0 ? fields : undefined;
}

function collectErrorEntries(entries) {
  const fields = {};

  entries.forEach((entry) => {
    if (!entry || !isObject(entry)) return;

    const loc = Array.isArray(entry.loc) ? entry.loc : [];
    const field =
      entry.field || entry.path || entry.param || loc[loc.length - 1];
    const msg = entry.message || entry.msg || entry.detail || entry.error;

    if (field && msg) fields[field] = msg;
  });

  return Object.keys(fields).length > 0 ? fields : undefined;
}

export function extractFields(data) {
  if (!data || (!isObject(data) && !Array.isArray(data))) return undefined;

  if (isObject(data.fields)) return stringifyFieldMap(data.fields);
  if (isObject(data.errors)) return stringifyFieldMap(data.errors);
  if (Array.isArray(data.errors)) return collectErrorEntries(data.errors);

  if (Array.isArray(data.detail)) return collectErrorEntries(data.detail);

  return undefined;
}

function extractServerMessage(data) {
  if (!data || typeof data !== 'object') return undefined;

  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }
  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }
  if (isObject(data.detail) && typeof data.detail.message === 'string') {
    return data.detail.message;
  }
  if (isObject(data.error) && typeof data.error.message === 'string') {
    return data.error.message;
  }

  return undefined;
}

export function normalizeError(error) {
  if (error && error.isApiError) return error;

  if (axios.isCancel(error)) {
    return {
      isApiError: true,
      status: null,
      code: 'CANCELLED',
      message: 'The request was cancelled.',
      fields: undefined,
      original: error,
    };
  }

  const status = error?.response?.status ?? null;
  const data = error?.response?.data;
  const serverMessage = extractServerMessage(data);
  const fields = extractFields(data);

  let message;
  let code;

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    message = 'The request timed out. Please check your connection and try again.';
    code = 'NETWORK_TIMEOUT';
  } else if (!error?.response) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    message = offline
      ? 'You appear to be offline. Please check your connection and try again.'
      : 'Unable to reach the server. Please check your connection and try again.';
    code = 'NETWORK_ERROR';
  } else if (VALIDATION_STATUSES.has(status) && fields) {
    message = 'Please review the highlighted fields and try again.';
    code = status;
  } else if (status >= 500) {
    message = MESSAGES[status] || DEFAULT_MESSAGE;
    code = status;
  } else {
    message = serverMessage || MESSAGES[status] || DEFAULT_MESSAGE;
    code = status;
  }

  return {
    isApiError: true,
    status,
    code,
    message,
    fields,
    original: error,
  };
}

export function logError(error) {
  const safe = normalizeError(error);

  console.error('[API Error]', {
    code: safe.code,
    status: safe.status,
    message: safe.message,
    fields: safe.fields,
  }, safe.original);
}

import { AlertCircle } from 'lucide-react';
import './ErrorAlert.css';

export default function ErrorAlert({ error, className = '' }) {
  if (!error) return null;

  const message = error?.message || 'Something went wrong. Please try again.';
  const fields = error?.fields;

  return (
    <div className={`error-alert ${className}`} role="alert">
      <AlertCircle size={18} className="error-alert-icon" />

      <div className="error-alert-body">
        <span className="error-alert-message">{message}</span>

        {fields && Object.keys(fields).length > 0 && (
          <ul className="error-alert-fields">
            {Object.entries(fields).map(([field, msg]) => (
              <li key={field}>
                <strong>{field}:</strong> {msg}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function FieldError({ error, name }) {
  const message = error?.fields?.[name];
  if (!message) return null;

  return <span className="field-error">{message}</span>;
}

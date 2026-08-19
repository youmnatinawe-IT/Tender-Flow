import { useMemo, useState } from "react";
import {
  X,
  ShieldCheck,
  Search,
  Check,
} from "lucide-react";

export default function CreateRoleModal({
  permissions,
  onClose,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [selectedPermissions, setSelectedPermissions] =
    useState([]);

  const [search, setSearch] = useState("");

  const filteredPermissions = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    if (!value) return permissions;

    return permissions.filter(
      (permission) =>
        permission.name
          .toLowerCase()
          .includes(value) ||
        permission.module
          .toLowerCase()
          .includes(value),
    );
  }, [permissions, search]);

  const togglePermission = (id) => {
    setSelectedPermissions((current) =>
      current.includes(id)
        ? current.filter(
            (permissionId) =>
              permissionId !== id,
          )
        : [...current, id],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    onCreate({
      name: name.trim(),
      description:
        description.trim() ||
        "Custom system role.",
      permissions: selectedPermissions,
    });
  };

  return (
    <div
      className="rp-modal-overlay"
      onClick={onClose}
    >

      <div
        className="rp-create-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* Header */}

        <div className="rp-modal-header">

          <div className="rp-modal-title">

            <div className="rp-modal-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <span>ACCESS CONTROL</span>
              <h2>Create New Role</h2>
            </div>

          </div>

          <button
            type="button"
            className="rp-modal-close"
            onClick={onClose}
          >
            <X size={19} />
          </button>

        </div>

        {/* Body */}

        <form
          className="rp-modal-body"
          onSubmit={handleSubmit}
        >

          {/* Role Name */}

          <div className="rp-form-field">

            <label>
              Role Name
              <span>*</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Tender Manager"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />

          </div>

          {/* Description */}

          <div className="rp-form-field">

            <label>Description</label>

            <textarea
              placeholder="Describe what this role is responsible for..."
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={3}
            />

          </div>

          {/* Permissions */}

          <div className="rp-permission-selector">

            <div className="rp-selector-header">

              <div>
                <label>
                  Permissions
                </label>

                <span>
                  {selectedPermissions.length}{" "}
                  selected
                </span>
              </div>

              <div className="rp-selector-search">

                <Search size={15} />

                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                />

              </div>

            </div>

            <div className="rp-selector-list">

              {filteredPermissions.map(
                (permission) => {
                  const selected =
                    selectedPermissions.includes(
                      permission.id,
                    );

                  return (
                    <button
                      type="button"
                      key={permission.id}
                      className={`rp-selector-item ${
                        selected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        togglePermission(
                          permission.id,
                        )
                      }
                    >

                      <div
                        className={`rp-selector-check ${
                          selected
                            ? "checked"
                            : ""
                        }`}
                      >
                        {selected && (
                          <Check size={13} />
                        )}
                      </div>

                      <div>
                        <strong>
                          {permission.name}
                        </strong>

                        <span>
                          {permission.module}
                        </span>
                      </div>

                    </button>
                  );
                },
              )}

            </div>

          </div>

          {/* Footer */}

          <div className="rp-modal-footer">

            <button
              type="button"
              className="rp-secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rp-primary-btn"
              disabled={!name.trim()}
            >
              <ShieldCheck size={17} />
              Create Role
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
import { useState } from "react";

// configures the connection for a role or user
interface ConnectionConfig {
    tables: string[] | null;  // list of tables the role/user has access to; null means full access
    allow_terminal: boolean;  // whether terminal access is allowed
}

// permissions for a single role or user
interface PermEntry {
    connections: Record<string, ConnectionConfig>;  // connection name to config mapping
}

// overall permissions structure
interface ChatStatsPerms {
    roles: Record<string, PermEntry>;  // role name to permissions mapping
    users: Record<string, PermEntry>;  // user name to permissions mapping
}

// MOCK DATA - this will be replaced with actual data from the backend

// authority roles that can be assigned permissions
const AUTH_ROLES = ["viewer", "commenter", "editor", "moderator", "admin"];

// connections available in the system
const AVAILABLE_CONNECTIONS = ["VIEWPOINT", "ANALYTICS", "REPORTING"];

// mock user list
const INITIAL_USER_EMAILS = [
    "alice@example.com",
    "bob@example.com",
    "charlie@example.com",
    "david@example.com",
    "eve@example.com",
];

// initial permissions data
// this is a mock structure to demonstrate the UI; in the real application, this would be fetched from the backend
const initialPerms: ChatStatsPerms = {
    roles: {
        admin: {
            connections: {
                VIEWPOINT: { tables: null, allow_terminal: true },
                ANALYTICS: { tables: null, allow_terminal: true },
                REPORTING: { tables: null, allow_terminal: true },
            },
        },
        moderator: {
            connections: {
                VIEWPOINT: { tables: ["messages", "users"], allow_terminal: false },
                ANALYTICS: { tables: ["engagement"], allow_terminal: false },
                REPORTING: { tables: ["daily_summary"], allow_terminal: false },
            },
        },
        editor: {
            connections: {
                VIEWPOINT: { tables: ["messages"], allow_terminal: false },
                ANALYTICS: { tables: ["engagement"], allow_terminal: false },
                REPORTING: { tables: [], allow_terminal: false },
            },
        },
        commenter: {
            connections: {
                VIEWPOINT: { tables: ["messages"], allow_terminal: false },
                ANALYTICS: { tables: [], allow_terminal: false },
                REPORTING: { tables: [], allow_terminal: false },
            },
        },
        viewer: {
            connections: {
                VIEWPOINT: { tables: ["messages"], allow_terminal: false },
                ANALYTICS: { tables: ["engagement"], allow_terminal: false },
                REPORTING: { tables: [], allow_terminal: false },
            },
        },
    },
    users: {
        "alice@example.com": {
            connections: {
                VIEWPOINT: { tables: ["messages"], allow_terminal: false },
                ANALYTICS: { tables: [], allow_terminal: false },
                REPORTING: { tables: [], allow_terminal: false },
            },
        },
    },
};

// styling
const csStyles = `
  /* ── Section heading ── */
  .cs-section-title {
    font-size: 1.5rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ridgemont-blue); border-bottom: 2px solid var(--ridgemont-blue);
    padding-bottom: 0.6rem; margin-bottom: 0.6rem;
  }
  .cs-caption { font-size: 1.2rem; color: #6b7280; margin-bottom: 1rem; font-style: italic; }

  /* ── Field primitives ── */
  .cs-label {
    font-size: 1.2rem; font-weight: 700; color: #555;
    letter-spacing: 0.06em; text-transform: uppercase; display: block; margin-bottom: 0.3rem;
  }
  .cs-select, .cs-textarea {
    width: 100%; padding: 0.85rem 1.1rem;
    border: 2px solid #D8E4EE; border-radius: 0;
    font-family: "Nunito Sans", sans-serif; font-size: 1.4rem; font-weight: 600;
    color: var(--ridgemont-black); background: var(--ridgemont-white);
    outline: none; transition: border-color 0.2s, background 0.2s;
  }
  .cs-select:focus, .cs-textarea:focus {
    border-color: var(--ridgemont-blue); background: var(--ridgemont-blue-light);
  }
  .cs-select   { cursor: pointer; }
  .cs-textarea { resize: vertical; min-height: 6rem; }

  /* ── Checkbox label ── */
  .cs-checkbox-label {
    display: flex; align-items: center; gap: 0.8rem;
    font-size: 1.4rem; font-weight: 600; cursor: pointer;
  }
  .cs-checkbox { width: 1.6rem; height: 1.6rem; accent-color: var(--ridgemont-blue); cursor: pointer; }

  /* ── Connection multi-select (pill checkboxes) ── */
  .cs-conn-group {
    display: flex; flex-wrap: wrap; gap: 0.6rem;
    padding: 0.8rem; border: 2px solid #D8E4EE; background: var(--ridgemont-white);
  }
  .cs-conn-group label {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 1.3rem; font-weight: 600; cursor: pointer;
    padding: 0.3rem 0.8rem; border: 1.5px solid #D8E4EE;
    transition: background 0.15s;
  }
  .cs-conn-group label:hover { background: var(--ridgemont-blue-light); }
  .cs-conn-group input[type="checkbox"] {
    accent-color: var(--ridgemont-blue); width: 1.4rem; height: 1.4rem; cursor: pointer;
  }

  /* ── Per-connection config card ── */
  .cs-conn-card {
    border: 2px solid #D8E4EE; padding: 1.2rem;
    display: flex; flex-direction: column; gap: 0.8rem;
    background: var(--ridgemont-white);
  }
  .cs-conn-card__title {
    font-size: 1.3rem; font-weight: 800; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--ridgemont-blue);
  }

  /* ── Buttons ── */
  .cs-btn {
    padding: 0.9rem 2rem; border: 2px solid; border-radius: 0;
    font-family: "Nunito Sans", sans-serif; font-size: 1.3rem; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
    transition: background 0.2s, color 0.2s; white-space: nowrap;
  }
  .cs-btn--primary { background: var(--ridgemont-blue); color: #fff; border-color: var(--ridgemont-blue); }
  .cs-btn--primary:hover { background: var(--ridgemont-blue-dark); border-color: var(--ridgemont-blue-dark); }
  .cs-btn--danger  { background: transparent; color: #c0392b; border-color: #c0392b; }
  .cs-btn--danger:hover  { background: #fdf3f3; }

  /* ── Toolbar ── */
  .cs-toolbar { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.4rem; }

  /* ── Divider ── */
  .cs-divider { border: none; border-top: 2px solid #D8E4EE; margin: 2rem 0; }

  /* ── Feedback ── */
  .cs-success {
    font-size: 1.3rem; font-weight: 600; color: #27ae60;
    background: #f0faf4; border: 1.5px solid #27ae60; padding: 0.8rem 1.2rem;
  }

  /* ── Field wrapper ── */
  .cs-field { display: flex; flex-direction: column; gap: 0.4rem; }
`;

// edits the permissions and what a user can see based on their role

// this interface defines the props for the PermissionEditor component, which is responsible for rendering the UI to edit permissions for a specific role or user
interface PermissionEditorProps {
    scope: "roles" | "users";                       // whether we're editing role-based permissions or user overrides
    entityKey: string;                              // the specific role name or user email being edited
    perms: ChatStatsPerms;                          // the full permissions state, used to read current settings
    onChange: (updated: ChatStatsPerms) => void;    // callback to update permissions state when changes are made
}

// the function that renders the permission editor UI for a given role or user, allowing selection of connections and configuration of table access and terminal permissions
function PermissionEditor({ scope, entityKey, perms, onChange }: PermissionEditorProps) {
    // make the key lowercase
    const key = entityKey.trim().toLowerCase();
    // get the current permissions
    const existing: PermEntry | null = (perms[scope][key] ?? { connections: {} });
    const [selectedConns, setSelectedConns] = useState<string[]>(Object.keys(existing.connections));
    const [connConfigs, setConnConfigs] = useState<Record<string, ConnectionConfig>>(
        () => Object.fromEntries(
            AVAILABLE_CONNECTIONS.map(alias => [
                alias,
                existing.connections[alias] ?? { tables: null, allow_terminal: true },
            ])
        )
    );
    const [msg, setMsg] = useState<string>("");

    // toggle whether a connection is selected
    const toggleConn = (alias: string) => {
        setSelectedConns(prev => 
            prev.includes(alias) ? prev.filter(a => a !== alias) : [...prev, alias]
        );
    }

    // update the tables config for a connection
    const updateTables = (alias: string, raw: string) => {
        const tables = raw.split("\n").map(t => t.trim()).filter(t => t);
        setConnConfigs(prev => ({
            ...prev,
            [alias]: {
                ...prev[alias],
                [alias]: { ...prev[alias], tables: tables.length ? tables : null },
            },
        }));
    }

    // update the terminal access config for a connection
    const updateTerminal = (alias: string, val: boolean) => {
        setConnConfigs(prev => ({
            ...prev,
            [alias]: { ...prev[alias], allow_terminal: val },
        }));
    }

    // save the changes to the permissions state
    const handleSave = () => {
        const updated: PermEntry = {
            connections: Object.fromEntries(
                selectedConns.map(alias => [alias, connConfigs[alias]])
            ),
        };
        onChange({
            ...perms,
            [scope]: {
                ...perms[scope],
                [key]: updated,
            },
        });
        setMsg("Permissions updated successfully!");
    }

    // remove the overrides for this entity, reverting to default permissions
    const handleRemove = () => {
        const updated = { ...perms[scope] };
        delete updated[key];
        onChange({
            ...perms,
            [scope]: updated });
        setSelectedConns([]);
        setMsg("Overrides removed, reverted to default permissions.");
    };

    const hasExistingEntry = Boolean(perms[scope][key]);

    // returns the permission editor UI for a single role or user, depending on the scope and entityKey props
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <div className="cs-field">
            <label className="cs-label">Connections (select all this entity may access)</label>
            <div className="cs-conn-group">
            {AVAILABLE_CONNECTIONS.map(alias => (
                <label key={alias}>
                <input
                    type="checkbox"
                    checked={selectedConns.includes(alias)}
                    onChange={() => toggleConn(alias)}
                />
                {alias}
                </label>
            ))}
            </div>
        </div>
        {selectedConns.map(alias => (
            <div key={alias} className="cs-conn-card">
            <p className="cs-conn-card__title">{alias}</p>
            <div className="cs-field">
                <label className="cs-label">
                Allowed Tables for {alias}{" "}
                <span style={{ fontWeight: 400, textTransform: "none", fontSize: "1.1rem", color: "#6b7280" }}>
                    (schema.table, one per line; leave empty to allow all)
                </span>
                </label>
                <textarea
                className="cs-textarea"
                value={(connConfigs[alias]?.tables ?? []).join("\n")}
                onChange={e => updateTables(alias, e.target.value)}
                placeholder={"dbo.Calls\ndbo.Agents"}
                />
            </div>
            <label className="cs-checkbox-label">
                <input
                type="checkbox"
                className="cs-checkbox"
                checked={connConfigs[alias]?.allow_terminal ?? true}
                onChange={e => updateTerminal(alias, e.target.checked)}
                />
                Allow SQL Terminal for {alias}
            </label>
            </div>
        ))}
      <div className="cs-toolbar">
        <button className="cs-btn cs-btn--primary" onClick={handleSave}>Save Permissions</button>
        {hasExistingEntry && (
          <button className="cs-btn cs-btn--danger" onClick={handleRemove}>Remove Overrides</button>
        )}
      </div>
      {msg && <p className="cs-success">{msg}</p>}
    </div>
  );
}



// exports the tab component for ChatStats permissions management, which includes both role-based and user override sections

export default function ChatStatsPermsTab() {
  // Shared permissions state — both role and user sections read/write from here
  const [perms, setPerms] = useState<ChatStatsPerms>(initialPerms);

  // Currently selected role for role-based section
  const [selectedRole, setSelectedRole] = useState(AUTH_ROLES[0]);

  // Currently selected email for user-override section
  const [selectedEmail, setSelectedEmail] = useState(INITIAL_USER_EMAILS[0]);

  return (
    <>
      <style>{csStyles}</style>
      <p className="cs-caption">
        Assign ChatStats connections per role or user. Leaving the tables list empty grants access
        to all views for that connection.
      </p>
      <p className="cs-section-title">Role-Based Access</p>
      <div className="cs-field" style={{ marginBottom: "1.2rem" }}>
        <label className="cs-label">Role</label>
        <select
          className="cs-select"
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          {AUTH_ROLES.map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>
      </div>
      <PermissionEditor
        key={`role-${selectedRole}`}
        scope="roles"
        entityKey={selectedRole}
        perms={perms}
        onChange={setPerms}
      />

      <hr className="cs-divider" />
      <p className="cs-section-title">User Overrides</p>
      <p className="cs-caption">
        User overrides take precedence over role-based permissions for the selected user.
      </p>
      <div className="cs-field" style={{ marginBottom: "1.2rem" }}>
        <label className="cs-label">User Email</label>
        <select
          className="cs-select"
          value={selectedEmail}
          onChange={e => setSelectedEmail(e.target.value)}
        >
          {INITIAL_USER_EMAILS.map(email => (
            <option key={email} value={email}>{email}</option>
          ))}
        </select>
      </div>
      <PermissionEditor
        key={`user-${selectedEmail}`}
        scope="users"
        entityKey={selectedEmail}
        perms={perms}
        onChange={setPerms}
      />
    </>
  );
}
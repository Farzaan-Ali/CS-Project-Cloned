import { useState } from "react";

// this will create the UI fields
interface ModuleMeta {
    label: string;
    icon?: string;
    target?: string;
    order: number;
    roles: string[];
    users: string[];
    // These roles are only present in the AP Module
    adminTabRoles?: string[];
    adminTabUsers?: string[];
}

// this will create the UI for a portal
interface PortalMeta {
    title: string;
    description: string;
    modules: string[];
}

// quick tools visibility settings
interface QuickToolEntry {
    roles: string[];
    users: string[];
}

// all quick tools for configuration
interface QuickToolsMeta {
    roles: string[];                        // module-wide allowed roles
    users: string[];                        // module-wide allowed users
    tools: Record<string, QuickToolEntry>;  // per-tool overrides
}

// THIS IS MOCK DATA, REPLACE WITH API CALLS AND/OR OTHER BACKEND INTEGRATION

// the available roles
const roles = ["viewer", "commenter", "editor", "moderator", "admin"];

// the available modules
const modules: Record<string, ModuleMeta> = {
    "ChatStats": {
        label: "Chat Statistics",
        icon: "💬",
        target: "chatstats_ui: main", 
        order: 10,
        roles: [...roles],              // all roles can see this module
        users: [],                      // no user-specific overrides
    },
    "AP Module": {
        label: "AP Module",
        icon: "📊", 
        target: "ap_ui:main",           
        order: 30, 
        roles: [...roles],              // all roles can see this module
        users: [],                      // no user-specific overrides
        adminTabRoles: ["admin"], 
        adminTabUsers: [] 
    },
    "Quick Tools": { 
        label: "Quick Tools", 
        icon: "🔧", 
        target: "quick_tools:main",     
        order: 40, 
        roles: [...roles],              // all roles can see this module
        users: []                       // no user-specific overrides
    },    
};

// the available portals
const portals: Record<string, PortalMeta> = {
    "waffle": {
        title: "WAFFLE",
        description: "The main WAFFLE portal, where you can access all modules and tools.",
        modules: ["ChatStats", "Quick Tools"],
    },
    "analytics": {
        title: "Analytics",
        description: "The analytics portal, where you can access data analysis and visualization modules.",
        modules: ["ChatStats", "AP Module"],
    },
    "admin": {
        title: "Admin",
        description: "The admin portal, where you can access administrative modules and tools.",
        modules: ["ChatStats","AP Module", "Quick Tools"],
    },
};

// the quick tools configuration
const quickToolsConfig: QuickToolsMeta = {
    roles: [...roles],                      // all roles can access quick tools by default
    users: [],                              // no user-specific overrides by default
    tools: {
        "SQL Terminal": {
            roles: ["admin", "moderator"], // only admins and moderators can access the SQL Terminal
            users: []                      // no user-specific overrides
        },
        "Data Export": {
            roles: [...roles],             // all roles can access the Data Export tool
            users: []                      // no user-specific overrides
        },
        "Log Viewer": {
            roles: ["admin"],               // only admins can access the User Management tool
            users: []                       // no user-specific overrides
        },
    }
};

// these utilities help with efficency and functionality

// capitalize the first letter of a string
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// normalizes a user input string to a standard format (e.g. lowercase, trimmed)
function normalizeInput(raw: string): string[] {
    const seen = new Set<string>();
    return raw
        .split("\n")
        .map(l => l.trim().toLowerCase())
        .filter(l => l && !seen.has(l) && (seen.add(l), true));
}

// sorts the module ids by field then alphabetically
function sortModules(modules: Record<string, ModuleMeta>): string[] {
    return Object.keys(modules).sort((a, b) => {
        const modA = modules[a]. order ?? 0;
        const modB = modules[b].order ?? 0;
        return modA !== modB ? modA - modB : a.localeCompare(b);
    });
}

// the next suggested order value for a new module, based on existing modules
function nextModuleOrder(modules: Record<string, ModuleMeta>): number {
    const orders = Object.values(modules).map(m => m.order ?? 0);
    return orders.length ? Math.max(...orders) + 10 : 10;
}

// shared styles, injected once by the tab component
const sharedStyles = `
  /* ── Section headings ── */
  .rm-section-title {
    font-size: 1.5rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ridgemont-blue); border-bottom: 2px solid var(--ridgemont-blue);
    padding-bottom: 0.6rem; margin-bottom: 1.2rem;
  }
  .rm-caption {
    font-size: 1.2rem; color: #6b7280; margin-top: -0.6rem; margin-bottom: 1rem; font-style: italic;
  }

  /* ── Two-column form grid ── */
  .rm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 2.4rem; }

  /* ── Form field primitives (reused across all tabs) ── */
  .rm-label {
    font-size: 1.2rem; font-weight: 700; color: #555;
    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.3rem; display: block;
  }
  .rm-input, .rm-select, .rm-textarea {
    width: 100%; padding: 0.85rem 1.1rem;
    border: 2px solid #D8E4EE; border-radius: 0;
    font-family: "Nunito Sans", sans-serif; font-size: 1.4rem; font-weight: 600;
    color: var(--ridgemont-black); background: var(--ridgemont-white);
    outline: none; transition: border-color 0.2s, background 0.2s;
  }
  .rm-input:focus, .rm-select:focus, .rm-textarea:focus {
    border-color: var(--ridgemont-blue); background: var(--ridgemont-blue-light);
  }
  .rm-textarea { resize: vertical; min-height: 7rem; }
  .rm-select   { cursor: pointer; }

  /* ── Number input ── */
  .rm-number {
    width: 100%; padding: 0.85rem 1.1rem;
    border: 2px solid #D8E4EE; border-radius: 0;
    font-family: "Nunito Sans", sans-serif; font-size: 1.4rem; font-weight: 600;
    color: var(--ridgemont-black); background: var(--ridgemont-white);
    outline: none; transition: border-color 0.2s, background 0.2s;
  }
  .rm-number:focus { border-color: var(--ridgemont-blue); background: var(--ridgemont-blue-light); }

  /* ── Role / user checkbox multi-select ── */
  .rm-checkbox-group {
    display: flex; flex-wrap: wrap; gap: 0.6rem;
    padding: 0.8rem; border: 2px solid #D8E4EE; background: var(--ridgemont-white);
  }
  .rm-checkbox-group label {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 1.3rem; font-weight: 600; cursor: pointer;
    padding: 0.3rem 0.8rem; border: 1.5px solid #D8E4EE;
    transition: background 0.15s;
  }
  .rm-checkbox-group label:hover { background: var(--ridgemont-blue-light); }
  .rm-checkbox-group input[type="checkbox"] {
    accent-color: var(--ridgemont-blue); width: 1.4rem; height: 1.4rem; cursor: pointer;
  }

  /* ── Buttons ── */
  .rm-btn {
    padding: 0.9rem 2rem; border: 2px solid; border-radius: 0;
    font-family: "Nunito Sans", sans-serif; font-size: 1.3rem; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
    transition: background 0.2s, color 0.2s; white-space: nowrap;
  }
  .rm-btn--primary { background: var(--ridgemont-blue); color: #fff; border-color: var(--ridgemont-blue); }
  .rm-btn--primary:hover { background: var(--ridgemont-blue-dark); border-color: var(--ridgemont-blue-dark); }
  .rm-btn--ghost   { background: transparent; color: var(--ridgemont-blue); border-color: var(--ridgemont-blue); }
  .rm-btn--ghost:hover { background: var(--ridgemont-blue-light); }
  .rm-btn--danger  { background: transparent; color: #c0392b; border-color: #c0392b; }
  .rm-btn--danger:hover { background: #fdf3f3; }

  /* ── Expandable "Add new" accordion ── */
  .rm-expander summary {
    cursor: pointer; font-size: 1.3rem; font-weight: 700; color: var(--ridgemont-blue);
    letter-spacing: 0.04em; text-transform: uppercase;
    padding: 0.8rem 1rem; border: 2px solid var(--ridgemont-blue);
    list-style: none; user-select: none;
    transition: background 0.15s;
  }
  .rm-expander summary:hover { background: var(--ridgemont-blue-light); }
  .rm-expander[open] summary { background: var(--ridgemont-blue); color: #fff; }
  .rm-expander__body {
    padding: 1.6rem; border: 2px solid var(--ridgemont-blue); border-top: none;
    display: flex; flex-direction: column; gap: 1.2rem;
    background: var(--ridgemont-white);
  }

  /* ── Dividers between sections ── */
  .rm-divider { border: none; border-top: 2px solid #D8E4EE; margin: 2rem 0; }

  /* ── Field wrapper (label + control stacked) ── */
  .rm-field { display: flex; flex-direction: column; gap: 0.4rem; }

  /* ── Error text ── */
  .rm-error { font-size: 1.2rem; font-weight: 600; color: #c0392b; }

  /* ── Success flash ── */
  .rm-success {
    font-size: 1.3rem; font-weight: 600; color: #27ae60;
    background: #f0faf4; border: 1.5px solid #27ae60;
    padding: 0.8rem 1.2rem;
  }

  /* ── Module row toolbar ── */
  .rm-toolbar { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.8rem; }

  @media screen and (max-width: 700px) {
    .rm-grid { grid-template-columns: 1fr; }
  }
`;

// role checkbox group component, used in multiple places

// props for the role checkbox group component
interface RoleCheckboxGroupProps {
    selected: string[];
    onChange: (updated: string[]) => void;
}

// renders the checkboxes
function RoleCheckboxGroup({ selected, onChange }: RoleCheckboxGroupProps) {
    const toggle = (role: string) => {
        onChange(
            selected.includes(role)
                ? selected.filter(r => r !== role)
                : [...selected, role]
        );
    }
    return (
        <div className="rm-checkbox-group">
            {roles.map(role => (
                <label key={role}>
                <input
                    type="checkbox"
                    checked={selected.includes(role)}
                    onChange={() => toggle(role)}
                />
                {capitalize(role)}
                </label>
            ))}
        </div>
    );
}

// the module editor component, used for both creating and editing modules

// props for the module editor component
interface ModuleEditorProps {
    modules: Record<string, ModuleMeta>;
    onChange: (updated: Record<string, ModuleMeta>) => void;
}

// renders the module editor form
function ModuleEditor({ modules, onChange }: ModuleEditorProps) {
    // form state for the new module
    const moduleIds = sortModules(modules);

    // the currently selected module ID in the dropdown, used to populate the form fields for editing
    const [selectedId, setSelectedId] = useState<string>(moduleIds[0] ?? "");

    // fields for the module being created or edited
    const meta = modules[selectedId] ?? {} as ModuleMeta;
    const [label, setLabel] = useState<string>("");
    const [icon, setIcon] = useState<string>("");
    const [target, setTarget] = useState<string>("");
    const [order, setOrder] = useState<number>(nextModuleOrder(modules));
    const [roles, setRoles] = useState<string[]>([]);
    const [users, setUsers] = useState<string[]>([]);

    // ap module-specific fields
    const [adminRoles, setAdminRoles] = useState<string[]>(meta.adminTabRoles ?? []);
    const [adminUsersRaw, setAdminUsersRaw] = useState((meta.adminTabUsers ?? []).join("\n"));

    // feedback message
    const [msg, setMsg] = useState("");

    // switches the selected module
    const handleSelect = (id: string) => {
        setSelectedId(id);
        const mod = modules[id] ?? {} as ModuleMeta;
        setLabel(mod.label ?? "");
        setIcon(mod.icon ?? "");
        setTarget(mod.target ?? "");
        setOrder(mod.order ?? nextModuleOrder(modules));
        setRoles(mod.roles ?? []);
        setUsers(mod.users ?? []);
        setAdminRoles(mod.adminTabRoles ?? []);
        setAdminUsersRaw((mod.adminTabUsers ?? []).join("\n"));
        setMsg("");
    };

    // saves the module being edited or created
    const handleSave = () => {
        const entry: ModuleMeta = {
            label: label || selectedId,
            icon: icon || undefined,
            target: target.trim() || undefined,
            order: Number(order) || 0,
            roles,
            users: normalizeInput(adminUsersRaw),
        };
        // attaches ap module-specific fields if this is the AP Module
        if (selectedId === "AP Module") {
            entry.adminTabRoles = adminRoles;
            entry.adminTabUsers = normalizeInput(adminUsersRaw);
        }
        onChange({ ...modules, [selectedId]: entry });
        setMsg("Module saved successfully!");
    };

    // adds a new module state
    const [newId, setNewId] = useState("");
    const [newLabel, setNewLabel]           = useState("");
    const [newIcon, setNewIcon]             = useState("");
    const [newTarget, setNewTarget]         = useState("");
    const [newOrder, setNewOrder]           = useState(nextModuleOrder(modules));
    const [newRoles, setNewRoles]           = useState<string[]>([...roles]);
    const [newUsersRaw, setNewUsersRaw]     = useState("");
    const [newErr, setNewErr]               = useState("");

    // creates a new module based on the form state, with basic validation
    const handleCreate = () => {
        const trimId = newId.trim();
        if (!trimId) {
            setNewErr("Module ID cannot be empty.");
            return;
        }
        if (modules[trimId]) {
            setNewErr("Module ID already exists.");
            return;
        }
        const entry: ModuleMeta = {
            label: newLabel || trimId,
            icon: newIcon || undefined,
            target: newTarget.trim() || undefined,
            order: Number(newOrder) || 0,
            roles: newRoles,
            users: normalizeInput(newUsersRaw),
        };
        const updated = { ...modules, [trimId]: entry };
        // reset new module form
        setNewId("");
        setNewLabel("");
        setNewIcon("");
        setNewTarget("");
        setNewOrder(nextModuleOrder(updated));
        setNewRoles([...roles]);
        setNewUsersRaw("");
        setNewErr("");
        setMsg(`Module "${entry.label}" created successfully!`);
    };

    // returns the rendered form
    return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      <p className="rm-section-title">Modules</p>
      <p className="rm-caption">
        Manage module metadata. Changes persist to the module registry via module_config.json.
      </p>

      {/* ── Module selector dropdown ── */}
      <div className="rm-field">
        <label className="rm-label">Module</label>
        <select className="rm-select" value={selectedId} onChange={e => handleSelect(e.target.value)}>
          {moduleIds.map(id => (
            <option key={id} value={id}>{modules[id]?.label ?? id}</option>
          ))}
        </select>
      </div>

      {/* ── Edit fields for the selected module ── */}
      <div className="rm-grid">
        <div className="rm-field">
          <label className="rm-label">Label</label>
          <input className="rm-input" value={label} onChange={e => setLabel(e.target.value)} placeholder={selectedId} />
        </div>
        <div className="rm-field">
          <label className="rm-label">Icon (optional)</label>
          <input className="rm-input" value={icon} onChange={e => setIcon(e.target.value)} placeholder="e.g. 💬" />
        </div>
        <div className="rm-field" style={{ gridColumn: "1 / -1" }}>
          <label className="rm-label">Module Target (Python import or path.py:callable)</label>
          <input
            className="rm-input"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="e.g. chatstats_ui:main or ./tools.py:main_ui"
          />
        </div>
        <div className="rm-field">
          <label className="rm-label">Order (lower = first in sidebar)</label>
          <input className="rm-number" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} step={10} />
        </div>
        <div className="rm-field">
          <label className="rm-label">Allowed Users (emails, one per line; overrides role restrictions)</label>
          <textarea
            className="rm-textarea"
            value={adminUsersRaw}
            onChange={e => setAdminUsersRaw(e.target.value)}
            placeholder={"alice@example.com\nbob@example.com"}
          />
        </div>
        <div className="rm-field" style={{ gridColumn: "1 / -1" }}>
          <label className="rm-label">Allowed Roles</label>
          <RoleCheckboxGroup selected={roles} onChange={setRoles} />
        </div>
      </div>

      {/* ── AP Module-specific fields — only rendered when that module is selected ── */}
      {selectedId === "AP Module" && (
        <div className="rm-grid" style={{ borderTop: "2px dashed #D8E4EE", paddingTop: "1rem" }}>
          <div className="rm-field" style={{ gridColumn: "1 / -1" }}>
            <label className="rm-label">AP Admin Tab — Allowed Roles</label>
            <RoleCheckboxGroup selected={adminRoles} onChange={setAdminRoles} />
          </div>
          <div className="rm-field" style={{ gridColumn: "1 / -1" }}>
            <label className="rm-label">AP Admin Tab — Allowed Users (emails, one per line)</label>
            <textarea
              className="rm-textarea"
              value={adminUsersRaw}
              onChange={e => setAdminUsersRaw(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
        </div>
      )}

      {/* ── Save button + feedback ── */}
      <div className="rm-toolbar">
        <button className="rm-btn rm-btn--primary" onClick={handleSave}>Save Module</button>
      </div>
      {msg && <p className="rm-success">{msg}</p>}

      {/* ── Add new module expander — mirrors the st.expander("Add new module") ── */}
      <details className="rm-expander">
        <summary>＋ Add New Module</summary>
        <div className="rm-expander__body">
          <div className="rm-grid">
            <div className="rm-field">
              <label className="rm-label">Module ID <span style={{ color: "#c0392b" }}>*</span></label>
              <input className="rm-input" value={newId} onChange={e => { setNewId(e.target.value); setNewErr(""); }} placeholder="UniqueModuleID" />
            </div>
            <div className="rm-field">
              <label className="rm-label">Label</label>
              <input className="rm-input" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Display label" />
            </div>
            <div className="rm-field">
              <label className="rm-label">Icon (optional)</label>
              <input className="rm-input" value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="e.g. 🔧" />
            </div>
            <div className="rm-field">
              <label className="rm-label">Order</label>
              <input className="rm-number" type="number" value={newOrder} onChange={e => setNewOrder(Number(e.target.value))} step={10} />
            </div>
            <div className="rm-field" style={{ gridColumn: "1 / -1" }}>
              <label className="rm-label">Module Target</label>
              <input className="rm-input" value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="module:callable" />
            </div>
            <div className="rm-field" style={{ gridColumn: "1 / -1" }}>
              <label className="rm-label">Allowed Users (optional, emails one per line)</label>
              <textarea className="rm-textarea" value={newUsersRaw} onChange={e => setNewUsersRaw(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="rm-field" style={{ gridColumn: "1 / -1" }}>
              <label className="rm-label">Allowed Roles</label>
              <RoleCheckboxGroup selected={newRoles} onChange={setNewRoles} />
            </div>
          </div>
          {newErr && <p className="rm-error">{newErr}</p>}
          <button className="rm-btn rm-btn--primary" onClick={handleCreate}>Create Module</button>
        </div>
      </details>
    </div>
  );
}
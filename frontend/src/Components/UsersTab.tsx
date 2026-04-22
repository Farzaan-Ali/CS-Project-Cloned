import { useState } from "react";

// roles that can be assigned to users in order of least to most permissions
const roles = [
    "Viewer",
    "Commenter",
    "Editor",
    "Moderator",
    "Admin",
];

// sets the default role to lowest permissions
const DEFAULT_ROLE = roles[0];

// defines the portals that users will have access to
const portals = [
    "WAFFLE",
    "Analytics",
    "Automation",
    "Admin",
];

// the user interface; what info we need or will show for each user
interface User {
    id: number;
    name: string;
    displayName: string;
    email: string;
    role: string;
    portal: string;
    isActive: boolean;
}

// the list of initial users, primarily for testing purposes
const initialUsers: User[] = [
    {   id: 1, 
        name: "Alice", 
        displayName: "Alice", 
        email: "alice@example.com", 
        role: "Admin", 
        portal: "Admin", 
        isActive: true 
    },
    {
        id: 2, 
        name: "Bob", 
        role: "Editor",
        displayName: "Bob",
        email: "bob@example.com",
        portal: "Analytics",
        isActive: false
    },
    {
        id: 3, 
        name: "Charlie", 
        role: "Viewer",
        displayName: "Charlie",
        email: "charlie@example.com",
        portal: "WAFFLE",
        isActive: false
    },
    {
        id: 4, 
        name: "David", 
        role: "Commenter",
        displayName: "David",
        email: "david@example.com",
        portal: "Automation",
        isActive: false
    },
    {
        id: 5, 
        name: "Eve", 
        role: "Moderator",
        displayName: "Eve",
        email: "eve@example.com",
        portal: "Admin",
        isActive: false
    },
];

// sets the next user ID to be one more than the highest current ID
let nextUserId = initialUsers.length + 1;

// will generate a temporary password that is meant to be changed later, but is required for the user interface to work properly for now
function generateTempPassword(length: number = 12): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// capitalizes the first letter of a string, used for display purposes
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// creates the role badge
const roleBadgeClass = (role: string): string => 'badge badge--role badge--${role.toLowerCase()}';

// sends a notification to the user for the status of their action
interface Toast {
    id: number;
    type: "success" | "error" | "info" | "warning";
    message: string;
}

// the interface for editing user information
interface EditPanelProps {
    user: User;
    onSave: (updatedInfo: { email: string; displayName: string; role: string; portal: string; isAcive: boolean; newPassword: string }) => void;
    onForcePasswordChange: () => void;
    onResetPin: () => void;
    onSetTempPassword: () => void;
    onClose: () => void;
}

// allows the user to edit information related to a user, such as their name, email, role, and portal access
function EditPanel({ user, onSave, onForcePasswordChange, onResetPin, onSetTempPassword, onClose }: EditPanelProps) {
    const [email, setEmail] = useState<string>(user.email);
    const [displayName, setDisplayName] = useState<string>(user.displayName);
    const [role, setRole] = useState<string>(user.role);
    const [portal, setPortal] = useState<string>(user.portal);
    const [isActive, setIsActive] = useState<boolean>(user.isActive);
    const [newPassword, setNewPassword] = useState<string>("");
    const [fieldErr, setFieldErr] = useState<string>("");

    const handleSave = () => {
        if (!email.trim())
        {
            setFieldErr("Email cannot be empty.");
            return;
        }
        onSave({ email: email.trim(), displayName: displayName.trim(), role, portal, isAcive: isActive, newPassword: newPassword.trim() });
        setNewPassword("");
        setFieldErr("");
    };

    // returns the visual interface for editing a user
    return (
     <div className="edit-panel">
      <div className="edit-panel__titlebar">
        <span className="edit-panel__title">Editing: <strong>{user.displayName || user.email}</strong></span>
        <button className="edit-panel__close" onClick={onClose} aria-label="Close">✕</button>
      </div>
 
      <div className="edit-panel__body">
        {/* ── Left column ── */}
        <div className="edit-panel__col">
          <label className="field-label">Email</label>
          <input className="field-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" />
 
          <label className="field-label">Display Name</label>
          <input className="field-input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" />
 
          <label className="field-label">Role</label>
          <select className="field-select" value={role} onChange={e => setRole(e.target.value)}>
            {roles.map(r => <option key={r} value={r}>{capitalize(r)}</option>)}
          </select>
 
          <label className="field-label">Portal</label>
          <select className="field-select" value={portal} onChange={e => setPortal(e.target.value)}>
            {portals.map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
          </select>
 
          <label className="field-label checkbox-label">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="field-checkbox" />
            Active
          </label>
        </div>
 
        {/* ── Right column ── */}
        <div className="edit-panel__col">
          <label className="field-label">New Password <span className="field-label--muted">(leave blank to keep current)</span></label>
          <input className="field-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
 
          {fieldErr && <p className="field-error">{fieldErr}</p>}
 
          <button className="btn btn--primary" onClick={handleSave} style={{ marginTop: "0.8rem" }}>Save Changes</button>
 
          <div className="admin-actions">
            <p className="admin-actions__label">Admin Actions</p>
            <button className="btn btn--ghost" onClick={onForcePasswordChange}>Force PW Change Next Login</button>
            <button className="btn btn--ghost" onClick={onResetPin}>Reset Recovery PIN</button>
            <button className="btn btn--ghost btn--danger-ghost" onClick={onSetTempPassword}>Set Temporary Password</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// the main component for managing users, including adding, removing, and changing their roles
function ListGroup() {
    // defines the users currently in the system
    const [users, setUsers]           = useState<User[]>(initialUsers);
    // defines the user you are editing
    const [selectedId, setSelectedId] = useState<number | null>(null);
    // defines the message for the add user form
    const [toasts, setToasts]         = useState<Toast[]>([]);
    // defines the number of messages
    const [toastCounter, setToastCounter] = useState(0);
 
    // defines the new user form fields and the default values for those fields
    const [newEmail, setNewEmail]         = useState("");
    const [newDisplay, setNewDisplay]     = useState("");
    const [newRole, setNewRole]           = useState(DEFAULT_ROLE);
    const [newPortal, setNewPortal]       = useState(portals[0]);
    const [newPassword, setNewPassword]   = useState("");
    const [newActive, setNewActive]       = useState(true);
    const [newFormErr, setNewFormErr]     = useState("");
    
    // finds the user via ID for editing, returns null if no user is selected
    const selectedUser = users.find(u => u.id === selectedId) ?? null;
 
    // ── Toast helpers ──
    // pushes a message to the user for the status of their action
    const pushToast = (type: Toast["type"], msg: string) => {
        const id = toastCounter + 1;
        setToastCounter(id);
        setToasts(prev => [...prev, { id, type, message: msg}]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };

    // this section will handle edits made to a particular user
    // updates the user information when saved
    const handleSave = (updated: Partial<User> & { newPassword?: string }) => {
        setUsers(prev => prev.map(u => u.id === selectedId ? { ...u, ...updated } : u));
        pushToast("success", "User updated successfully. Refresh to see all changes.");
    };
    // forces a user to change their password on their next login
    const handleForcePasswordChange = () => {
        pushToast("success", "User will be required to change their password on next login.");
    };
    // resets a user's recovery PIN, which is used to regain access to an account if the password is forgotten
    const handleResetPin = () => {
        pushToast("success", "Recovery PIN cleared. User must set a new PIN after logging in.");
    };
    // sets a temporary password for the user, which is meant to be changed on next login
    const handleSetTempPassword = () => {
        const temp = generateTempPassword();
        pushToast("info", `Temporary password set: ${temp} — Share with user; they must change it on login.`);
    };

    // change a user's role, ensuring that the new role is valid
    const handleRoleChange = (id: number, role: string) => { 
        setUsers((prevUsers) => prevUsers.map((user) => user.id === id ? { ...user, role } : user));
    };

    // these will handle creating a user and manipulating the user list
    const handleCreateUser = () => {
        // makes sure an email has been provided
        const trimEmail = newEmail.trim();
        if (!trimEmail) { 
            setNewFormErr("Email is required."); 
            return; 
        }
        // makes sure a password has been provided
        if (!newPassword) { 
            setNewFormErr("Password is required."); 
            return; 
        }
        // makes sure there is not a duplicate email
        if (users.some(u => u.email.toLowerCase() === trimEmail.toLowerCase())) {
            setNewFormErr("A user with that email already exists.");
            return;
        }
        // creates the user object based on the form fields, using defaults where necessary
        const user: User = {
            id: nextUserId++,
            name: trimEmail.split("@")[0],
            displayName: newDisplay.trim() || trimEmail,
            email: trimEmail,
            role: newRole,
            portal: newPortal,
            isActive: newActive,
        };

        // sets new user to defaults
        setUsers(prev => [...prev, user]);
        setNewEmail(""); 
        setNewDisplay(""); 
        setNewRole(DEFAULT_ROLE);
        setNewPortal(portals[0]); 
        setNewPassword(""); 
        setNewActive(true); 
        setNewFormErr("");
        pushToast("success", `User "${user.displayName}" created successfully.`);
    };

    // removes a user from the list
    const handleRemoveUser = (id: number) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        if (selectedId === id) 
                setSelectedId(null);
        pushToast("warning", "User removed.");
    };

    return (
        <>
            <style>{`
                /* ── Toasts ── */
                .toast-stack {
                position: fixed; top: 2rem; right: 2rem; z-index: 9999;
                display: flex; flex-direction: column; gap: 0.8rem; max-width: 42rem;
                }
                .toast {
                display: flex; align-items: flex-start; gap: 1rem;
                padding: 1.2rem 1.6rem;
                font-family: "Nunito Sans", sans-serif; font-size: 1.3rem; font-weight: 600;
                border-left: 4px solid; border-radius: 0;
                box-shadow: 0 4px 16px rgba(0,0,0,0.12);
                animation: toastIn 0.2s ease;
                }
                @keyframes toastIn { from { opacity: 0; transform: translateX(2rem); } to { opacity: 1; transform: none; } }
                .toast--success { background: #f0faf4; border-color: #27ae60; color: #1a6b3c; }
                .toast--error   { background: #fdf3f3; border-color: #c0392b; color: #8b1a1a; }
                .toast--warning { background: #fffbf0; border-color: #e67e22; color: #7a4400; }
                .toast--info    { background: #E8F2FA; border-color: #006BB7; color: #004a7c; }
                .toast__msg     { flex: 1; line-height: 1.5; }
        
                /* ── User manager shell ── */
                .user-manager { width: 100%; display: flex; flex-direction: column; gap: 2rem; font-family: "Nunito Sans", sans-serif; }
        
                /* ── Search & list ── */
                .um-search {
                width: 100%; padding: 0.9rem 1.2rem;
                border: 2px solid var(--ridgemont-blue); border-radius: 0;
                font-family: "Nunito Sans", sans-serif; font-size: 1.4rem; font-weight: 600;
                color: var(--ridgemont-black); background: var(--ridgemont-white); outline: none;
                transition: background 0.2s, border-color 0.2s;
                }
                .um-search:focus { background: var(--ridgemont-blue-light); border-color: var(--ridgemont-blue-dark); }
                .um-search::placeholder { color: #94a3b8; font-weight: 400; }
        
                .user-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
                .user-list__item {
                display: flex; align-items: center; gap: 1.2rem;
                padding: 1rem 1.4rem; border: 1px solid #D8E4EE;
                background: var(--ridgemont-white); cursor: pointer;
                transition: background 0.15s; flex-wrap: wrap;
                }
                .user-list__item:hover    { background: var(--ridgemont-blue-light); }
                .user-list__item--active  { background: var(--ridgemont-blue-light) !important; border-color: var(--ridgemont-blue) !important; border-left: 3px solid var(--ridgemont-blue); }
                .user-list__name  { flex: 1; font-size: 1.45rem; font-weight: 700; color: var(--ridgemont-black); min-width: 10rem; }
                .user-list__email { font-size: 1.2rem; color: #6b7280; min-width: 14rem; }
                /* ── Unified badges ── */
                .badge {
                display: inline-flex; align-items: center; justify-content: center;
                width: 10rem; height: 2.6rem;
                font-size: 1.1rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
                border: 1.5px solid; border-radius: 0; white-space: nowrap; flex-shrink: 0;
                }
                /* Role variants */
                .badge--admin     { background: #006BB7; color: #fff;     border-color: #006BB7; }
                .badge--moderator { background: #005494; color: #fff;     border-color: #005494; }
                .badge--editor    { background: #E8F2FA; color: #006BB7;  border-color: #006BB7; }
                .badge--commenter { background: #f0f4f8; color: #555;     border-color: #bbb;    }
                .badge--viewer    { background: #f8f9fa; color: #888;     border-color: #ddd;    }
                /* Status variants */
                .badge--active    { background: #f0faf4; color: #27ae60;  border-color: #27ae60; }
                .badge--inactive  { background: #f8f9fa; color: #aaa;     border-color: #ddd;    }
        
                .remove-user-btn {
                padding: 0.5rem 1.2rem; background: transparent; color: #c0392b;
                border: 2px solid #c0392b; border-radius: 0;
                font-family: "Nunito Sans", sans-serif; font-size: 1.1rem; font-weight: 700;
                letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; white-space: nowrap;
                transition: background 0.2s, color 0.2s;
                }
                .remove-user-btn:hover { background: #c0392b; color: #fff; }
        
                .no-users { font-size: 1.4rem; color: #94a3b8; font-style: italic; text-align: center; padding: 2rem 0; }
        
                /* ── Edit panel ── */
                .edit-panel {
                border: 1px solid var(--ridgemont-blue); background: var(--ridgemont-white);
                padding: 0; margin-top: 0.4rem;
                }
                .edit-panel__titlebar {
                display: flex; align-items: center; justify-content: space-between;
                padding: 1.2rem 1.8rem;
                background: var(--ridgemont-blue); color: #fff;
                font-family: "Nunito Sans", sans-serif;
                }
                .edit-panel__title  { font-size: 1.4rem; font-weight: 700; letter-spacing: 0.04em; }
                .edit-panel__close  {
                background: transparent; border: none; color: #fff; font-size: 1.6rem;
                cursor: pointer; line-height: 1; padding: 0 0.2rem;
                transition: opacity 0.15s;
                }
                .edit-panel__close:hover { opacity: 0.7; }
                .edit-panel__body   { display: flex; gap: 2.4rem; padding: 2rem 1.8rem; flex-wrap: wrap; }
                .edit-panel__col    { flex: 1; min-width: 22rem; display: flex; flex-direction: column; gap: 1rem; }
        
                /* ── Field components ── */
                .field-label { font-size: 1.2rem; font-weight: 700; color: #555; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: -0.4rem; }
                .field-label--muted { font-weight: 400; text-transform: none; font-size: 1.1rem; color: #999; }
                .field-input, .field-select {
                padding: 0.85rem 1.1rem; border: 2px solid #D8E4EE; border-radius: 0;
                font-family: "Nunito Sans", sans-serif; font-size: 1.4rem; font-weight: 600;
                color: var(--ridgemont-black); background: var(--ridgemont-white); outline: none;
                transition: border-color 0.2s, background 0.2s; width: 100%;
                }
                .field-input:focus, .field-select:focus { border-color: var(--ridgemont-blue); background: var(--ridgemont-blue-light); }
                .field-input::placeholder { color: #94a3b8; font-weight: 400; }
                .field-select { cursor: pointer; }
                .checkbox-label { display: flex; align-items: center; gap: 0.8rem; font-size: 1.4rem; font-weight: 700; cursor: pointer; }
                .field-checkbox { width: 1.6rem; height: 1.6rem; accent-color: var(--ridgemont-blue); cursor: pointer; }
                .field-error { font-size: 1.2rem; font-weight: 600; color: #c0392b; margin: 0; }
        
                /* ── Buttons ── */
                .btn {
                padding: 0.9rem 2rem; border: 2px solid; border-radius: 0;
                font-family: "Nunito Sans", sans-serif; font-size: 1.3rem; font-weight: 700;
                letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; white-space: nowrap;
                transition: background 0.2s, color 0.2s; display: block; width: 100%; text-align: center;
                }
                .btn--primary { background: var(--ridgemont-blue); color: #fff; border-color: var(--ridgemont-blue); }
                .btn--primary:hover { background: var(--ridgemont-blue-dark); border-color: var(--ridgemont-blue-dark); }
                .btn--ghost   { background: transparent; color: var(--ridgemont-blue); border-color: var(--ridgemont-blue); }
                .btn--ghost:hover { background: var(--ridgemont-blue-light); }
                .btn--danger-ghost { color: #c0392b; border-color: #c0392b; }
                .btn--danger-ghost:hover { background: #fdf3f3; }
        
                /* ── Admin actions ── */
                .admin-actions { display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1.2rem; }
                .admin-actions__label { font-size: 1.2rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ridgemont-blue); border-bottom: 2px solid var(--ridgemont-blue); padding-bottom: 0.4rem; }
        
                /* ── Divider ── */
                .um-divider { border: none; border-top: 2px solid var(--ridgemont-blue); margin: 0.4rem 0; }
        
                /* ── Create user form ── */
                .create-user { display: flex; flex-direction: column; gap: 1rem; }
                .create-user__heading { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ridgemont-blue); border-bottom: 2px solid var(--ridgemont-blue); padding-bottom: 0.6rem; }
                .create-user__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem 2rem; }
                .create-user__error { font-size: 1.2rem; font-weight: 600; color: #c0392b; }
        
                @media screen and (max-width: 700px) {
                .edit-panel__body   { flex-direction: column; }
                .create-user__grid  { grid-template-columns: 1fr; }
                .user-list__email   { display: none; }
                }
            `}</style>
            
        {/* ── Toasts ── */}
        <div className="toast-stack">
            {toasts.map(t => (
            <div key={t.id} className={`toast toast--${t.type}`}>
                <span className="toast__msg">{t.message}</span>
            </div>
            ))}
        </div>
    
        <div className="user-manager">
    
            {/* ── User list ── */}
            <input className="um-search" placeholder="Search users by name or email…" onChange={e => {
            const q = e.target.value.toLowerCase();
            // visual filter only — highlight via state would need extra wiring; this keeps it simple
            const items = document.querySelectorAll<HTMLLIElement>(".user-list__item");
            items.forEach(el => {
                el.style.display = el.textContent?.toLowerCase().includes(q) ? "" : "none";
            });
            }} />
    
            {users.length === 0
            ? <p className="no-users">No users found.</p>
            : (
                <ul className="user-list">
                {users.map(user => (
                    <li
                    key={user.id}
                    className={`user-list__item${selectedId === user.id ? " user-list__item--active" : ""}`}
                    onClick={() => setSelectedId(prev => prev === user.id ? null : user.id)}
                    >
                    <span className="user-list__name">{user.displayName || user.name}</span>
                    <span className="user-list__email">{user.email}</span>
                    <span className={roleBadgeClass(user.role)}>{capitalize(user.role)}</span>
                    <span className={`badge badge--status badge--${user.isActive ? "active" : "inactive"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                        className="remove-user-btn"
                        onClick={e => { e.stopPropagation(); handleRemoveUser(user.id); }}
                    >
                        Remove
                    </button>
                    </li>
                ))}
                </ul>
            )}
    
            {/* ── Edit panel (inline, below selected user) ── */}
            {selectedUser && (
            <EditPanel
                key={selectedUser.id}
                user={selectedUser}
                onSave={handleSave}
                onForcePasswordChange={handleForcePasswordChange}
                onResetPin={handleResetPin}
                onSetTempPassword={handleSetTempPassword}
                onClose={() => setSelectedId(null)}
            />
            )}
    
            <hr className="um-divider" />
    
            {/* ── Create new user ── */}
            <div className="create-user">
            <p className="create-user__heading">Create New User</p>
            <div className="create-user__grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="field-label">Email <span style={{ color: "#c0392b" }}>*</span></label>
                <input className="field-input" type="email" placeholder="user@example.com" value={newEmail} onChange={e => { setNewEmail(e.target.value); setNewFormErr(""); }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="field-label">Display Name</label>
                <input className="field-input" placeholder="Full name" value={newDisplay} onChange={e => setNewDisplay(e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="field-label">Role</label>
                <select className="field-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                    {roles.map(r => <option key={r} value={r}>{capitalize(r)}</option>)}
                </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="field-label">Portal</label>
                <select className="field-select" value={newPortal} onChange={e => setNewPortal(e.target.value)}>
                    {portals.map(p => <option key={p} value={p}>{capitalize(p)}</option>)}
                </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="field-label">Initial Password <span style={{ color: "#c0392b" }}>*</span></label>
                <input className="field-input" type="password" placeholder="••••••••" value={newPassword} onChange={e => { setNewPassword(e.target.value); setNewFormErr(""); }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "flex-end" }}>
                <label className="field-label checkbox-label" style={{ marginBottom: "0.6rem" }}>
                    <input type="checkbox" className="field-checkbox" checked={newActive} onChange={e => setNewActive(e.target.checked)} />
                    Active
                </label>
                </div>
            </div>
    
            {newFormErr && <p className="create-user__error">{newFormErr}</p>}
    
            <button className="btn btn--primary" style={{ marginTop: "0.4rem" }} onClick={handleCreateUser}>
                + Create User
            </button>
            </div>
    
        </div>
        </>
    );

}

export default ListGroup;
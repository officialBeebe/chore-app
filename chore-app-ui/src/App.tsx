import { useEffect, useState } from "react";
import "./App.css";
import type { CreateChorePayload } from "./api";

/* ======================================================
   Time / Date Helpers
====================================================== */

function formatLocalDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeDueDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  // Local end of day (23:59:59.999 local time)
  const localEndOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

  // Convert to UTC ISO string for storage
  return localEndOfDay.toISOString();
}


function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/* ======================================================
   Types
====================================================== */

type Chore = {
  id: string;
  name: string;
  description?: string;
  frequency: number;
  dueDate: string;
  createdDate: string;
  updatedDate: string;
};

type ChoreItemProps = {
  chore: Chore;
  onDelete: (id: string) => void;
  onTouch: (id: string) => void;
};

type CreateChoreFormProps = {
  onCreate: (payload: CreateChorePayload) => void;
  onCancel: () => void;
};

/* ======================================================
   Chore Item
====================================================== */

function ChoreItem({ chore, onDelete, onTouch }: ChoreItemProps) {
  // DEBUG
  // console.log("Raw dueDate from API:", chore.dueDate);
  // console.log("As local:", new Date(chore.dueDate).toString());
  
  const dueTimestamp = new Date(chore.dueDate).getTime();
  const [remainingMs, setRemainingMs] = useState(
    Math.max(dueTimestamp - Date.now(), 0)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(Math.max(dueTimestamp - Date.now(), 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [dueTimestamp]);

  return (
    <div className="chore">
      <h3>{chore.name}</h3>

      {chore.description && <p>{chore.description}</p>}

      <p className="countdown">
        {remainingMs > 0
          ? `${formatDuration(remainingMs)} remaining`
          : "Overdue"}
      </p>

      <p className="due-date">
        Due by {formatLocalDateTime(chore.dueDate)}
      </p>

      <div className="buttons">
        <button className="touch-button" onClick={() => onTouch(chore.id)}>
          Touch
        </button>

        <button className="delete-button" onClick={() => onDelete(chore.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

/* ======================================================
   Create Chore Form
====================================================== */

function CreateChoreForm({ onCreate, onCancel }: CreateChoreFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState(1);
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    onCreate({
      name,
      description: description || undefined,
      frequency,
      dueDate: normalizeDueDate(dueDate),
    });
  }

  return (
    <div className="modal">
      <form className="create-form" onSubmit={handleSubmit}>
        <h2>Create Chore</h2>

        <label>
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Frequency (days)
          <input
            type="number"
            min={1}
            required
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
          />
        </label>

        <label>
          Due date
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </label>

        <div className="buttons">
          <button type="submit">Create</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ======================================================
   App
====================================================== */

function App() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function fetchChores() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/items`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: Chore[] = await res.json();
        setChores(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load chores");
      } finally {
        setLoading(false);
      }
    }

    fetchChores();
  }, []);

  async function createChore(payload: CreateChorePayload) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/items`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();

      const result = await res.json();

      const itemRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/items/${result.id}`
      );
      const newChore: Chore = await itemRes.json();

      setChores((prev) => [...prev, newChore]);
      setShowCreate(false);
    } catch {
      setError("Failed to create chore");
    }
  }

  async function deleteChore(id: string) {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/items/${id}`,
        { method: "DELETE" }
      );

      setChores((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Failed to delete chore");
    }
  }

  async function touchChore(id: string) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/items/${id}`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error();

      const updated = await res.json();

      setChores((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, dueDate: updated.dueDate, updatedDate: updated.updatedDate }
            : c
        )
      );
    } catch {
      setError("Failed to touch chore");
    }
  }

  return (
    <>
      <h1>Chore App</h1>

      <button className="create-button" onClick={() => setShowCreate(true)}>
        + Create Chore
      </button>

      {showCreate && (
        <CreateChoreForm
          onCreate={createChore}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && chores.length === 0 && <p>No chores yet</p>}

      <div className="chore-grid">
        {chores.map((chore) => (
          <ChoreItem
            key={chore.id}
            chore={chore}
            onDelete={deleteChore}
            onTouch={touchChore}
          />
        ))}
      </div>
    </>
  );
}

export default App;

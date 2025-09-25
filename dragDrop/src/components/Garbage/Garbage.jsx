import React, { useState } from "react";
import styles from "./Garbage.module.css";
import { useGame } from "../../context/GameProvider";

export default function Garbage() {
  const { removeInventory, deleteSlot } = useGame();
  const [over, setOver] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.from === "inventory" && p.uid) {
        removeInventory(p.uid);
      } else if (p.from === "craft" && typeof p.slotIndex === "number") {
        deleteSlot(p.slotIndex);
      }
    } catch (err) { console.error("garbage drop parse", err); }
  };

  return (
    <div
      className={styles.root}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      style={{ borderColor: over ? "#e53935" : undefined }}
    >
      <div className={styles.icon}>🗑️</div>
      <div>Aruncă aici pentru a șterge</div>
    </div>
  );
}

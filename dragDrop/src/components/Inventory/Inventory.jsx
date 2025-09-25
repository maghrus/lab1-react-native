import React from "react";
import styles from "./Inventory.module.css";
import { useGame } from "../../context/GameProvider";
import resourcesCatalog from "../../data/resources.json";

export default function Inventory() {
  const { state, moveToSlot } = useGame();
  const items = state?.inventory ?? [];

  const firstFreeSlot = () => {
    if (!state?.craftingSlots) return -1;
    return state.craftingSlots.findIndex((s) => s === null);
  };

  const onItemClick = (uid) => {
    const slot = firstFreeSlot();
    if (slot === -1) {
      console.warn("Nu există slot liber în masa de crafting.");
      return;
    }
    moveToSlot(uid, slot);
  };

  const onDragStart = (e, uid) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ uid, from: "inventory" })
    );
  };
  const lookup = (id) => resourcesCatalog.find((r) => r.id === id);

  return (
    <div className={styles.root}>
      <h3>
        Inventar
      </h3>
      <div className={styles.grid}>
        {items.length === 0 && (
          <div className={styles.empty}>Inventarul este gol</div>
        )}
        {items.map((it, idx) => {
          const def = lookup(it.id);
          const img = it.img || def?.image || null;
          const name = it.name || def?.name || it.id;
          return (
            <div
              key={it.uid}
              className={styles.item}
              draggable
              onDragStart={(e) => onDragStart(e, it.uid)}
              onClick={() => onItemClick(it.uid)}
              title="Click pentru a plasa în primul slot liber sau trage pentru a plasa într-un slot specific"
            >
              <div className={styles.imgWrap}>
                {img ? (
                  <img src={img} alt={name} />
                ) : (
                  <div className={styles.vf}>{name?.[0] ?? "?"}</div>
                )}
              </div>
              <div className={styles.label}>{name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

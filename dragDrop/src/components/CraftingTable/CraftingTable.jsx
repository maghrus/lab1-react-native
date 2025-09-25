import React, { useMemo } from "react";
import styles from "./CraftingTable.module.css";
import { useGame } from "../../context/GameProvider";

function gridIdsFromSlots(slots) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    rows.push(
      slots.slice(r * 3, r * 3 + 3).map((cell) => (cell ? cell.id : null))
    );
  }
  return rows;
}

function matchPattern(gridIds, recipePattern) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const need = recipePattern?.[r]?.[c] ?? null;
      const got = gridIds?.[r]?.[c] ?? null;
      if (need !== got) return false;
    }
  }
  return true;
}

export default function CraftingTable() {
  const {
    state,
    moveToSlot,
    moveSlotToInventory,
    moveSlotToSlot,
    craftSuccess,
    clearSlots,
  } = useGame();

  const slots = state.craftingSlots ?? Array(9).fill(null);

  const onDropToSlot = (e, slotIndex) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (payload.from === "inventory") {
        moveToSlot(payload.uid, slotIndex);
      } else if (payload.from === "craft") {
        const fromIndex = payload.slotIndex;
        const toIndex = slotIndex;
        if (fromIndex === toIndex) return;
        moveSlotToSlot(fromIndex, toIndex);
      }
    } catch (err) {
      console.error("drop parse err", err);
    }
  };

  const onDragOver = (e) => e.preventDefault();

  const onSlotDragStart = (e, slotIndex) => {
    const cell = slots[slotIndex];
    if (!cell) return;
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ uid: cell.uid, from: "craft", slotIndex })
    );
  };

  const onSlotClick = (slotIndex) => {
    moveSlotToInventory(slotIndex);
  };

  const gridIds = gridIdsFromSlots(slots);
  const matchedRecipe = useMemo(() => {
    const recipes = state.recipes ?? [];
    for (const r of recipes) {
      if (r.pattern && matchPattern(gridIds, r.pattern)) return r;
    }
    return null;
  }, [gridIds, state.recipes]);

  const onCraft = () => {
    if (!matchedRecipe) return;
    craftSuccess(matchedRecipe);
  };

  const rows = [];
  for (let r = 0; r < 3; r++) rows.push(slots.slice(r * 3, r * 3 + 3));

  console.log(
    "recipes count",
    (state.recipes || []).length,
    "craftingSlots",
    state.craftingSlots
  );

  return (
    <div className={styles.container}>
      <h3>Masa de gătit</h3>

      <div className={styles.rowWrap}>
        <div className={styles.grid}>
          {rows.map((row, ri) => (
            <div key={ri} className={styles.row}>
              {row.map((cell, ci) => {
                const idx = ri * 3 + ci;
                return (
                  <div
                    key={idx}
                    className={styles.cell}
                    onDrop={(e) => onDropToSlot(e, idx)}
                    onDragOver={onDragOver}
                    onClick={() => {
                      if (cell) onSlotClick(idx);
                    }}
                  >
                    {cell ? (
                      <div
                        draggable
                        onDragStart={(e) => onSlotDragStart(e, idx)}
                        className={styles.item}
                        title="Trage în alt slot sau click pentru a trimite în inventar"
                      >
                        {cell.img ? (
                          <img src={cell.img} alt={cell.name} />
                        ) : (
                          <div className={styles.letter}>{cell.name?.[0]}</div>
                        )}
                        <div className={styles.name}>{cell.name}</div>
                      </div>
                    ) : (
                      <div className={styles.empty}>Gol</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className={styles.resultBox}>
          <h4>Rezultat</h4>
          {matchedRecipe ? (
            <div className={styles.preview}>
              {matchedRecipe.image ? (
                <img src={matchedRecipe.image} alt={matchedRecipe.name} />
              ) : (
                <div className={styles.letter}>{matchedRecipe.name?.[0]}</div>
              )}
              <div className={styles.name}>{matchedRecipe.name}</div>
              <div className={styles.desc}>{matchedRecipe.description}</div>
              <button onClick={onCraft}>Craft</button>
            </div>
          ) : (
            <div className={styles.noMatch}>Nicio rețetă detectată</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => clearSlots()}>Golește masa</button>
      </div>
    </div>
  );
}

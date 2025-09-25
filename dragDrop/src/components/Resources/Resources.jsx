import React from "react";
import styles from "./Resources.module.css";
import { useGame } from "../../context/GameProvider";
import resourcesCatalog from "../../data/resources.json";

export default function Resources() {
  const { addResource } = useGame(); 

  const handleClickCard = (res) => {
    if (typeof addResource === "function") {
      addResource(res);
    } else {
      console.warn("addResource nu există în context");
    }
  };

  return (
    <div className={styles.root}>
      <h3>Resurse primare</h3>
      <div className={styles.grid}>
        {resourcesCatalog.map((r) => (
          <div
            key={r.id}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => handleClickCard(r)}
            onKeyDown={(e) => { if (e.key === "Enter") handleClickCard(r); }}
          >
            <div className={styles.thumb}>
              {r.image ? <img src={r.image} alt={r.name} /> : <div className={styles.emoji}>{r.emoji ?? r.name?.[0]}</div>}
            </div>
            <div className={styles.name}>{r.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

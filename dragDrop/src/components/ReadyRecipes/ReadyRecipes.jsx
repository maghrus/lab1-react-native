import React from "react";
import styles from "./ReadyRecipes.module.css";
import { useGame } from "../../context/GameProvider";

export default function ReadyRecipes() {
  const { state } = useGame();
  const { availableRecipes } = state;

  if (!availableRecipes || availableRecipes.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h2>Rețete disponibile</h2>
        <p className={styles.empty}>Nu ai suficiente ingrediente.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2>Rețete disponibile</h2>
      <div className={styles.grid}>
        {availableRecipes.map((recipe, idx) => (
          <div key={idx} className={styles.recipeCard}>
            <img src={recipe.image} alt={recipe.name} className={styles.icon} />
            <span className={styles.label}>{recipe.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

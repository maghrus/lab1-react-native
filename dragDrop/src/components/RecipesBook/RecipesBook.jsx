import React from "react";
import styles from "./RecipesBook.module.css";
import { useGame } from "../../context/GameProvider";

export default function RecipesBook() {
  const { state, dispatch } = useGame();
  const { discoveredRecipes } = state;

  const handleClick = (recipe) => {
    dispatch({ type: "LOAD_RECIPE_TO_CRAFTING", payload: recipe });
  };

  const handleDragStart = (e, recipe) => {
    e.dataTransfer.setData("source", "recipes");
    e.dataTransfer.setData("recipe", JSON.stringify(recipe));
  };

  if (!discoveredRecipes || discoveredRecipes.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h2>Rețete Descoperite</h2>
        <p className={styles.empty}>Încă nu ai descoperit nicio rețetă.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h2>Rețete Descoperite</h2>
      <div className={styles.grid}>
        {discoveredRecipes.map((recipe, idx) => (
          <div
            key={idx}
            className={styles.recipeCard}
            onClick={() => handleClick(recipe)}
            draggable
            onDragStart={(e) => handleDragStart(e, recipe)}
          >
            <img src={recipe.image} alt={recipe.name} className={styles.icon} />
            <span className={styles.label}>{recipe.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

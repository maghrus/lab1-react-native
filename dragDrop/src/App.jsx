import React from "react";
import Inventory from "./components/Inventory";
import CraftingTable from "./components/CraftingTable";
import Resources from "./components/Resources";
import ReadyRecipes from "./components/ReadyRecipes";
import RecipesBook from "./components/RecipesBook";
import Garbage from "./components/Garbage";
import { useGame } from "./context/GameProvider";
import "./App.css"; 

export default function App() {
  const { resetGame, state } = useGame();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="titlu">MasterChef USM</h1>
        {state.hasWon && (
          <div className="win-message">
            Ai descoperit toate rețetele! Felicitări!
          </div>
        )}
        <button className="restart-button" onClick={resetGame}>
          Restart Game
        </button>
      </header>

      <main className="game-layout">
        <section className="crafting-area">
          <Resources />
          <div className="gatit">
            <Inventory />
            <CraftingTable />
          </div>
          <ReadyRecipes />
          <RecipesBook />
        </section>

        <aside className="side-area">
          <Garbage />
        </aside>
      </main>
    </div>
  );
}

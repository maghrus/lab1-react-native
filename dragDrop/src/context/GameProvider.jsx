import React, { createContext, useContext, useEffect, useReducer } from "react";
import resourcesCatalog from "../data/resources.json";
import recipesCatalog from "../data/recipes.json";

const LS_KEY = "cookingcraft_state_v1";

const INITIAL_STATE = {
  inventory: [],
  craftingSlots: Array(9).fill(null),
  discovered: [],
  recipes: [],
  availableRecipes: [],
  resourcesCatalog: [],
  hasWon: false,
  discoveredRecipes: [],
};

function loadState(initial) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : initial;
  } catch (e) {
    console.warn("LS read error", e);
    return initial;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("LS write error", e);
  }
}

function getAvailableRecipes(state) {
  const inventoryIds = state.inventory.map((item) => item.id);
  const recipes = state.recipes ?? [];

  return recipes.filter((recipe) => {
    const patternIds = recipe.pattern.flat().filter(Boolean);
    return patternIds.every((ing) => inventoryIds.includes(ing));
  });
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_RECIPES":
      return { ...state, recipes: action.payload };
    case "SET_RESOURCES":
      return { ...state, resourcesCatalog: action.payload };

    case "ADD_RESOURCE_INSTANCE": {
      const res = action.payload;
      const uid = `${res.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      return {
        ...state,
        inventory: [
          ...state.inventory,
          { uid, id: res.id, name: res.name, img: res.image },
        ],
      };
    }

    case "ADD_RESOURCE_TO_SLOT": {
      const res = action.payload;
      const uid = `${res.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const firstFree = state.craftingSlots.findIndex((s) => s === null);
      if (firstFree === -1) {
        return {
          ...state,
          inventory: [
            ...state.inventory,
            { uid, id: res.id, name: res.name, img: res.image },
          ],
        };
      }
      const newSlots = [...state.craftingSlots];
      newSlots[firstFree] = { uid, id: res.id, name: res.name, img: res.image };
      return { ...state, craftingSlots: newSlots };
    }

    case "CRAFT_SUCCESS": {
      const recipe = action.payload;

      const uid = `${recipe.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;

      const newInventory = [
        ...state.inventory,
        { uid, id: recipe.id, name: recipe.name, img: recipe.image },
      ];

      const discovered = state.discovered.includes(recipe.id)
        ? state.discovered
        : [...state.discovered, recipe.id];

      const discoveredRecipes = state.discoveredRecipes.find(
        (r) => r.id === recipe.id
      )
        ? state.discoveredRecipes
        : [...state.discoveredRecipes, recipe];

      const hasWon = discovered.length === (state.recipes?.length || 0);

      return {
        ...state,
        inventory: newInventory,
        discovered,
        discoveredRecipes,
        craftingSlots: Array(9).fill(null),
        hasWon,
      };
    }

    case "MOVE_SLOT_TO_SLOT": {
      const { fromIndex, toIndex } = action.payload;
      const newSlots = [...state.craftingSlots];
      [newSlots[fromIndex], newSlots[toIndex]] = [
        newSlots[toIndex],
        newSlots[fromIndex],
      ];
      return { ...state, craftingSlots: newSlots };
    }

    case "REMOVE_INVENTORY_BY_UID":
      return {
        ...state,
        inventory: state.inventory.filter((i) => i.uid !== action.payload),
      };

    case "MOVE_INVENTORY_TO_SLOT": {
      const { uid, slotIndex } = action.payload;
      const item = state.inventory.find((i) => i.uid === uid);
      if (!item) return state;
      const newInv = state.inventory.filter((i) => i.uid !== uid);
      const newSlots = [...state.craftingSlots];
      newSlots[slotIndex] = item;
      return { ...state, inventory: newInv, craftingSlots: newSlots };
    }

    case "MOVE_SLOT_TO_INVENTORY": {
      const idx = action.payload;
      const item = state.craftingSlots[idx];
      if (!item) return state;
      const newSlots = [...state.craftingSlots];
      newSlots[idx] = null;
      return {
        ...state,
        inventory: [...state.inventory, item],
        craftingSlots: newSlots,
      };
    }

    case "CLEAR_SLOTS":
      return { ...state, craftingSlots: Array(9).fill(null) };

    case "MOVE_INVENTORY": {
      const newInv = [...state.inventory];
      const { from, to } = action.payload;
      [newInv[from], newInv[to]] = [newInv[to], newInv[from]];
      return { ...state, inventory: newInv };
    }

    case "CLEAR_INVENTORY": {
      return { ...state, inventory: Array(state.inventory.length).fill(null) };
    }

    case "DELETE_SLOT": {
      const idx = action.payload; // index 0..8
      if (idx < 0 || idx > 8) return state;
      const newSlots = [...state.craftingSlots];
      newSlots[idx] = null;
      return { ...state, craftingSlots: newSlots };
    }

    case "UPDATE_AVAILABLE_RECIPES":
      return { ...state, availableRecipes: getAvailableRecipes(state) };

    case "RESET_ALL":
      return {
        ...INITIAL_STATE,
        recipes: state.recipes,
        resourcesCatalog: state.resourcesCatalog,
        discoveredRecipes: [],
        discovered: [],
        inventory: [],
        craftingSlots: Array(9).fill(null),
        hasWon: false,
      };

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    dispatch({ type: "UPDATE_AVAILABLE_RECIPES" });
  }, [state.inventory]);

  useEffect(() => {
    dispatch({ type: "SET_RESOURCES", payload: resourcesCatalog });
    dispatch({ type: "SET_RECIPES", payload: recipesCatalog });
  }, []);

  const addResource = (resource) =>
    dispatch({ type: "ADD_RESOURCE_INSTANCE", payload: resource });
  const addResourceToSlot = (resource) =>
    dispatch({ type: "ADD_RESOURCE_TO_SLOT", payload: resource });
  const removeInventory = (uid) =>
    dispatch({ type: "REMOVE_INVENTORY_BY_UID", payload: uid });
  const moveToSlot = (uid, slotIndex) =>
    dispatch({ type: "MOVE_INVENTORY_TO_SLOT", payload: { uid, slotIndex } });
  const deleteSlot = (slotIndex) =>
    dispatch({ type: "DELETE_SLOT", payload: slotIndex });
  const moveSlotToInventory = (slotIndex) =>
    dispatch({ type: "MOVE_SLOT_TO_INVENTORY", payload: slotIndex });
  const craftSuccess = (recipe) =>
    dispatch({ type: "CRAFT_SUCCESS", payload: recipe });
  const clearSlots = () => dispatch({ type: "CLEAR_SLOTS" });
  const resetGame = () => dispatch({ type: "RESET_ALL" });
  const moveInInventory = (from, to) =>
    dispatch({ type: "MOVE_INVENTORY", payload: { from, to } });

  const clearInventory = () => dispatch({ type: "CLEAR_INVENTORY" });
  const moveSlotToSlot = (fromIndex, toIndex) =>
    dispatch({ type: "MOVE_SLOT_TO_SLOT", payload: { fromIndex, toIndex } });

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        addResource,
        addResourceToSlot,
        removeInventory,
        moveToSlot,
        moveSlotToInventory,
        craftSuccess,
        clearSlots,
        resetGame,
        deleteSlot,
        clearInventory,
        moveSlotToSlot,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

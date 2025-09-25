import React from "react";
import styles from "./WinModal.module.css";

export default function WinModal({ isOpen, winner, onClose }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2> Felicitări!</h2>
        <p>{winner ? `${winner} a câștigat jocul!` : "Egalitate!"}</p>
        <button className={styles.button} onClick={onClose}>
          Închide
        </button>
      </div>
    </div>
  );
}

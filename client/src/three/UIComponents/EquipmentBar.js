import React, { useContext, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RoomContext } from "../../contexts/socketContext";
import { useEquipment } from "../../redux/PlayerDataReducer";
import { usePlayerEquipment } from "../../redux/AllPlayerReducer";
import "./EquipmentBar.css";
import { toast } from "react-toastify";
import { useAudio } from "../../hooks/useAudio";

const EquipmentBar = () => {
  const { ws, roomId } = useContext(RoomContext);
  const data = useSelector((state) => state.myPlayerData);
  const { bulletArr } = useSelector((state) => state.gameConfig);
  const { equipment, username } = data;
  const dispatch = useDispatch();
  const { playSound } = useAudio();
  const [isUsingEquipment, setIsUsingEquipment] = useState(false);

  const handleEquipmentUse = useCallback(async (eq) => {
    const equipmentCount = equipment[eq] || 0;
    if (isUsingEquipment || equipmentCount === 0) return;

    try {
      setIsUsingEquipment(true);
      
      // Play equipment sound
      playSound("/sounds/gun_load.mp3", { volume: 0.3 });

      // Handle special equipment effects
      if (eq === "looker") {
        // For looker, emit to server to get bullet status
        ws.emit("look-bullet", {
          roomId,
          player: username,
        });
      } else {
        toast.success(`✨ ${eq} activated!`, {
          autoClose: 2000
        });
      }

      // Emit to server - server will handle equipment consumption and broadcast to all clients
      console.log(`⚙️ [CLIENT] Emitting use-equipment event:`, {
        roomId,
        equipmentType: eq,
        player: username
      });
      ws.emit("use-equipment", {
        roomId,
        equipmentType: eq,
        player: username,
      });

      // Don't update local state here - wait for server response via used-equipment event
      // This prevents double consumption of equipment

    } catch (error) {
      console.error('Error using equipment:', error);
      toast.error('Failed to use equipment');
    } finally {
      setTimeout(() => setIsUsingEquipment(false), 1000);
    }
  }, [ws, roomId, username, equipment, playSound, isUsingEquipment]);

  const getEquipmentDescription = (eq) => {
    const descriptions = {
      heals: "Restore 1 life",
      looker: "Check if bullet is live",
      shield: "Block next shot",
      doubleDamage: "Next shot deals 2 damage",
      doubleTurn: "Take another turn",
      skip: "Skip to next player's turn"
    };
    return descriptions[eq] || "Unknown equipment";
  };

  return (
    <div className="equipment-bar">
      {equipment &&
        Object.keys(equipment).map((eq, i) => {
          const equipmentCount = equipment[eq] || 0;
          const isDisabled = equipmentCount === 0 || isUsingEquipment;
          return (
            <div key={eq} className="equipment-item">
              <button
                className={`equipment-button ${isUsingEquipment ? 'using' : ''}`}
                disabled={isDisabled}
                onClick={() => handleEquipmentUse(eq)}
                title={getEquipmentDescription(eq)}
              >
                <img src={`/assets/${eq}.png`} alt={eq} />
                <span className="equipment-count">{equipmentCount}</span>
                {isUsingEquipment && (
                  <div className="equipment-loading">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default EquipmentBar;

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
        const isLive = bulletArr[bulletArr.length - 1];
        toast.info(`🔍 ${isLive ? "Bullet is LIVE!" : "Bullet is FAKE!"}`, {
          autoClose: 3000,
          className: isLive ? 'toast-live' : 'toast-fake'
        });
      } else {
        toast.success(`✨ ${eq} activated!`, {
          autoClose: 2000
        });
      }

      // Emit to server
      ws.emit("use-equipment", {
        roomId,
        equipmentType: eq,
        player: username,
      });

      // Update local state
      dispatch({
        type: `${useEquipment}`,
        payload: {
          equipmentType: eq,
        },
      });

      dispatch({
        type: `${usePlayerEquipment}`,
        payload: {
          user: username,
          equipmentType: eq,
        },
      });

    } catch (error) {
      console.error('Error using equipment:', error);
      toast.error('Failed to use equipment');
    } finally {
      setTimeout(() => setIsUsingEquipment(false), 1000);
    }
  }, [ws, roomId, username, equipment, bulletArr, dispatch, playSound, isUsingEquipment]);

  const getEquipmentDescription = (eq) => {
    const descriptions = {
      heals: "Restore 1 life",
      looker: "Check if bullet is live",
      shield: "Block next shot",
      doubleDamage: "Next shot deals 2 damage",
      doubleTurn: "Take another turn"
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

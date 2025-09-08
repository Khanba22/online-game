import React, { useContext, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { RoomContext } from "../../contexts/socketContext";
import "./EquipmentBar.css";
import { toast } from "react-toastify";
import { useAudio } from "../../hooks/useAudio";

const EquipmentBar = () => {
  const { ws, roomId } = useContext(RoomContext);
  const data = useSelector((state) => state.myPlayerData);
  const { equipment, username } = data;
  const { playSound } = useAudio();
  const [isUsingEquipment, setIsUsingEquipment] = useState(false);

  const handleEquipmentUse = useCallback(async (eq) => {
    // Only check if already using equipment (prevent double-clicks)
    // Let server handle equipment availability validation
    if (isUsingEquipment) return;

    try {
      setIsUsingEquipment(true);
      
      // Play equipment sound
      playSound("/sounds/gun_load.mp3", { volume: 0.3 });

      // Get normalized room ID
      const normalizedRoomId = roomId?.toLowerCase();

      // Validate data before sending
      if (!normalizedRoomId) {
        console.error('❌ [CLIENT] No room ID available');
        toast.error('No room ID available');
        return;
      }
      
      if (!username) {
        console.error('❌ [CLIENT] No username available');
        toast.error('No username available');
        return;
      }

      // Handle special equipment effects
      if (eq === "looker") {
        // For looker, only emit use-equipment (not look-bullet)
        // The server will handle both the equipment consumption and bullet checking
        console.log(`⚙️ [CLIENT] Using looker equipment:`, {
          roomId: normalizedRoomId,
          equipmentType: eq,
          player: username,
          currentEquipment: equipment
        });
        
        ws.emit("use-equipment", {
          roomId: normalizedRoomId,
          equipmentType: eq,
          player: username,
        });
      } else {
        // For other equipment, show activation message and emit use-equipment
        toast.success(`✨ ${eq} activated!`, {
          autoClose: 2000
        });
        
        console.log(`⚙️ [CLIENT] Emitting use-equipment event:`, {
          roomId: normalizedRoomId,
          equipmentType: eq,
          player: username,
          currentEquipment: equipment
        });
        
        ws.emit("use-equipment", {
          roomId: normalizedRoomId,
          equipmentType: eq,
          player: username,
        });
      }

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
          // Only disable if currently using equipment (prevent double-clicks)
          // Server will handle equipment availability validation
          const isDisabled = isUsingEquipment;
          return (
            <div key={eq} className="equipment-item">
              <button
                className={`equipment-button ${isUsingEquipment ? 'using' : ''}`}
                disabled={isDisabled}
                onClick={() => handleEquipmentUse(eq)}
                title={`${getEquipmentDescription(eq)} (${equipmentCount} available)`}
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

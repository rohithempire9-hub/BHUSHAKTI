import React, { useState, useEffect, useRef } from 'react';
import { LandslideStation } from '../../types/landslide';
import { BhuNavSection } from '../Navigation/BhuShaktiSidebar';
import { CesiumDigitalTwin } from './CesiumDigitalTwin';
import { BHUSAKTHI_LOCATIONS, BHUSAKTHI_LOCATIONS_LIST } from '../../data/bhusakthiLocations';

interface DigitalTwin3DViewProps {
  selectedStation?: LandslideStation | null;
  onNavigate?: (section: BhuNavSection) => void;
  onOpenSmsModal?: () => void;
  onOpenEscapeModal?: () => void;
}

export const DigitalTwin3DView: React.FC<DigitalTwin3DViewProps> = ({
  selectedStation,
  onOpenSmsModal,
  onOpenEscapeModal,
}) => {
  // Default to Agartala as authoritative initial location
  const [selectedLocationId, setSelectedLocationId] = useState<string>('agartala');

  // Synchronize ONLY when external station selection changes
  const prevStationRef = useRef<LandslideStation | null | undefined>(selectedStation);
  useEffect(() => {
    if (selectedStation && selectedStation !== prevStationRef.current) {
      prevStationRef.current = selectedStation;
      const stationNameLower = selectedStation.name.toLowerCase();
      const matchLoc = BHUSAKTHI_LOCATIONS_LIST.find(
        (loc) =>
          stationNameLower.includes(loc.id) ||
          loc.id.includes(stationNameLower) ||
          (selectedStation.state && selectedStation.state.toLowerCase().includes(loc.state.toLowerCase()))
      );
      if (matchLoc) {
        setSelectedLocationId(matchLoc.id);
      }
    }
  }, [selectedStation]);

  return (
    <div className="viewer-wrapper absolute inset-0 w-full h-full overflow-hidden">
      <CesiumDigitalTwin
        selectedLocationId={selectedLocationId}
        onLocationChange={(locId) => setSelectedLocationId(locId)}
        onOpenSmsModal={onOpenSmsModal}
        onOpenEscapeModal={onOpenEscapeModal}
      />
    </div>
  );
};

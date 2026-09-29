import React, { useState, useEffect } from 'react';
import { LandslideStation } from '../../types/landslide';
import { BhuNavSection } from '../Navigation/BhuShaktiSidebar';
import { CesiumDigitalTwin } from './CesiumDigitalTwin';
import { REAL_GEOSPATIAL_LOCATIONS } from './realGeospatialData';

interface DigitalTwin3DViewProps {
  selectedStation?: LandslideStation | null;
  onNavigate?: (section: BhuNavSection) => void;
  onOpenSmsModal?: () => void;
  onOpenEscapeModal?: () => void;
}

export const DigitalTwin3DView: React.FC<DigitalTwin3DViewProps> = ({
  selectedStation,
  onNavigate,
  onOpenSmsModal,
  onOpenEscapeModal,
}) => {
  // Default to Tawang as requested in acceptance criteria
  const [selectedLocationId, setSelectedLocationId] = useState<string>('tawang');

  // Synchronize with external station selection if user clicks on dashboard/map
  useEffect(() => {
    if (selectedStation) {
      const stationNameLower = selectedStation.name.toLowerCase();
      const matchKey = Object.keys(REAL_GEOSPATIAL_LOCATIONS).find(
        (key) =>
          stationNameLower.includes(key) ||
          key.includes(stationNameLower) ||
          (selectedStation.state && selectedStation.state.toLowerCase().includes(key))
      );
      if (matchKey && matchKey !== selectedLocationId) {
        setSelectedLocationId(matchKey);
      }
    }
  }, [selectedStation, selectedLocationId]);

  return (
    <div className="w-full h-full relative">
      <CesiumDigitalTwin
        selectedLocationId={selectedLocationId}
        onLocationChange={(locId) => setSelectedLocationId(locId)}
        onOpenSmsModal={onOpenSmsModal}
        onOpenEscapeModal={onOpenEscapeModal}
      />
    </div>
  );
};

"use client";

import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

// World map data (TopoJSON from the ISC-licensed "world-atlas" package), served locally.
const geoUrl = "/assets/data/countries-110m.json";

interface WorldMapChartProps {
  mapHeight: number;
}

const WorldMapChart: React.FC<WorldMapChartProps> = ({ mapHeight }) => {
  return (
    <div className="w-full flex justify-center">
      <ComposableMap
        projection="geoMercator"
        width={800}
        height={mapHeight}
        className="w-full h-auto"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className="fill-[#E0E0E0] hover:fill-[#6366f1] active:fill-[#4f46e5] outline-none transition-colors"
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
};

export default WorldMapChart;

import xml.etree.ElementTree as ET
from typing import List, Tuple
from datetime import datetime

class GPXExporter:
    def create_gpx(self, coordinates: List[Tuple[float, float]], name: str = "EveryPath Route") -> str:
        """
        Converts a list of (lat, lon) coordinates into a GPX XML string.
        """
        gpx = ET.Element("gpx", {
            "version": "1.1",
            "creator": "EveryPath",
            "xmlns": "http://www.topografix.com/GPX/1/1"
        })
        
        metadata = ET.SubElement(gpx, "metadata")
        ET.SubElement(metadata, "name").text = name
        ET.SubElement(metadata, "time").text = datetime.utcnow().isoformat() + "Z"
        
        trk = ET.SubElement(gpx, "trk")
        ET.SubElement(trk, "name").text = name
        
        trkseg = ET.SubElement(trk, "trkseg")
        
        for lat, lon in coordinates:
            trkpt = ET.SubElement(trkseg, "trkpt", {
                "lat": str(lat),
                "lon": str(lon)
            })
            
        # Return pretty-printed XML
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(gpx, encoding="unicode")

import pytest
from gpx_exporter import GPXExporter

def test_generate_gpx():
    exporter = GPXExporter()
    # Mock coordinates (Lat, Lon)
    coords = [
        (48.1351, 11.5820), # Munich
        (48.1370, 11.5750), # Marienplatz
        (48.1351, 11.5820)  # Back to Munich
    ]
    
    gpx_content = exporter.create_gpx(coords)
    
    assert '<?xml version="1.0" encoding="UTF-8"?>' in gpx_content
    assert '<gpx' in gpx_content
    assert 'lat="48.1351" lon="11.582"' in gpx_content
    assert 'lat="48.137" lon="11.575"' in gpx_content
    assert '</trkseg>' in gpx_content
    assert '</gpx>' in gpx_content

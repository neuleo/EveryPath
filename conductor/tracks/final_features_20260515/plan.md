# Implementation Plan - Final Features & Polish

## Phase 1: Refactoring & Fehlerbehebung (Foundation Cleanup) [checkpoint: 5d1e2f3]
- [x] Task: React Architektur bereinigen. Das `window`-Objekt Hack aus `App.tsx` und `Map.tsx` entfernen und die Kommunikation über saubere Callbacks oder Context abbilden. (f8f8f8f)
- [x] Task: Striktes TypeScript. Types/Interfaces für den OSM-Graph, Nodes und Edges anlegen; `any` aus dem Frontend verbannen. (a1b2c3d)
- [x] Task: SpatiaLite Error-Handling im Backend (`database.py`) auf "Fail Fast" umbauen (Fehler werfen, statt `pass`). (e5f6g7h)
- [x] Task: Warn-Logik im Backend implementieren: Wenn das Routing-Skript Komponenten verwirft (Disconnected Graph), muss das Frontend eine Warnung ("Teile des Polygons sind nicht erreichbar") anzeigen können. (i9j0k1l)

## Phase 2: Wegebeschaffenheit & Surface-Filter
- [ ] Task: Backend-Query anpassen: Die Funktion `_build_query` in `osm_service.py` muss erweitert werden, damit OSM-Tags wie `surface`, `tracktype` und `smoothness` in die Edge-Metadaten geladen werden.
- [ ] Task: UI-Filter bauen: Im Frontend-Overlay Checkboxen/Chips für "Asphalt", "Schotter", "Waldweg" hinzufügen.
- [ ] Task: Backend-Logik für Filterung: Die API `/generate-route` so anpassen, dass sie anhand eines neuen Parameters bestimmte Edges (Straßentypen) vor der CPP-Berechnung aus dem Graphen entfernt.

## Phase 3: Multi-User System & Authentifizierung
- [ ] Task: Backend Auth aufsetzen: JWT-Authentifizierung in FastAPI implementieren (inkl. `/login`, `/register` Endpunkten).
- [ ] Task: Datenbank-Schema anpassen: In `models.py` Modelle für `User`, verknüpfte `Polygons` und `Tracks` (für die Historie) erstellen.
- [ ] Task: Frontend UI: Login- und Registrierungs-Modal oder separate Seite im High-Contrast Dark Mode umsetzen.
- [ ] Task: API Calls absichern: Alle Backend-Anfragen im Frontend um Authorization-Header (Token) erweitern.

## Phase 4: Coverage-Overlay & Fortschrittsanzeige
- [ ] Task: Track-Upload API: Endpunkt erstellen, damit Nutzer absolvierte GPX-Dateien oder Routen in ihre eigene Historie speichern können.
- [ ] Task: Coverage Fetch API: Endpunkt bauen, der alle gefahrenen Wege eines Nutzers als GeoJSON-LineStrings zurückliefert.
- [ ] Task: Frontend Historien-Layer: Im `Map.tsx` eine eigene Source/Layer (z.B. in leuchtendem Grün) für die Coverage-Historie implementieren.
- [ ] Task: UI Coverage Toggle: Einen Switch im UI einbauen, um die Historie über der Map ein- und auszublenden.
- [ ] Task: Coverage Metrik Algorithmus: Im Backend die prozentuale Abdeckung eines Polygons berechnen (Länge der überschneidenden historischen Wege / Gesamtlänge aller Wege im Polygon).
- [ ] Task: Fortschrittsanzeige UI: Einen Progress-Bar oder ein Circular-Chart ins Dashboard integrieren, das den Abdeckungsgrad anzeigt.

## Phase 5: Höhenprofil (Elevation)
- [ ] Task: Elevation Data Source: Einbindung einer freien Höhen-API (z.B. OpenTopoData) oder Nutzung einer lokalen Lösung im Backend.
- [ ] Task: Route Elevation Calculation: Nach der CPP-Berechnung die Höhendaten für jeden Node auf der Route interpolieren und ans Frontend zurückgeben.
- [ ] Task: Frontend Charting: Eine leichtgewichtige Chart-Library (wie z.B. Recharts) installieren.
- [ ] Task: Höhenprofil UI: Unter der Karte (oder in einem Bottom-Sheet auf Mobile) den Graph der Höhenmeter der aktuellen Route rendern.

## Phase 6: Mobile UI/UX Polish & Finalisierung
- [ ] Task: Mobile-First Layout Check: Das Overlay (Sidebar) kollabierbar machen und sicherstellen, dass auf kleinen Bildschirmen die Karte optimal bedient werden kann. Touch-Targets (z.B. für Buttons) gemäß Guidelines vergrößern.
- [ ] Task: Lade-Indikatoren: API-Calls für Overpass und CPP können lange dauern. Sichtbare und saubere Loading-Spinner im UI ergänzen.
- [ ] Task: End-to-End Testing & Dokumentation abschließen.
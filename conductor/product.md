# Initial Concept

Rolle: Du bist ein erfahrener Full-Stack-Entwickler und DevOps-Experte.

Aufgabe: Entwickle eine Webanwendung zur Berechnung des "Briefträgerproblems" (Chinese Postman Problem) für beliebig vom Nutzer definierte Kartenbereiche. Das Ziel ist es, eine Route zu generieren, die jede einzelne Straße/jeden Weg innerhalb eines markierten Gebiets mindestens einmal abdeckt.

Architektur & Technologie-Stack:

Keine Vorgaben: Wähle selbstständig die besten und modernsten Frameworks, Bibliotheken und APIs für Frontend, Backend, Datenbank und Routing-Algorithmus aus.

Strikte Docker-Pflicht: Die gesamte Anwendung muss vollständig in Docker laufen. Auch die komplette Entwicklung muss containerisiert stattfinden (z. B. via Devcontainers oder Docker Compose mit Volume-Mounts und Hot-Reloading). Auf dem Host-System dürfen absolut keine lokalen Dependencies (wie Node, Python, Datenbanken) installiert werden müssen.

Kernfunktionen (Web-App):

Gebietsauswahl: Der Nutzer muss auf einer Karte ein Polygon frei einzeichnen können, um das gewünschte Gebiet einzugrenzen.

Routen-Generierung: Das Backend berechnet für das Polygon die effizienteste Route, um jeden Weg abzufahren.

Sackgassen-Toggle: UI-Option, um Sackgassen in die Routenplanung einzubeziehen oder zu ignorieren.

Coverage-Overlay (Historie): Auf der Karte muss visuell dargestellt werden (z. B. durch farbliche Markierungen), welche Wege der Nutzer in der Vergangenheit bereits abgefahren ist. Dieses Overlay muss jederzeit ein- und ausschaltbar sein und auch während der Planung neuer Routen sichtbar bleiben.

GPX-Export: Die berechnete Route muss als .gpx-Datei exportierbar sein.

Modernes UI/UX: Die Oberfläche muss clean, responsiv und für Desktop sowie Smartphone optimiert sein.

Zusätzliche intelligente Features (von dir zu implementieren):

Wegebeschaffenheit / Surface-Filter: Erkennung und Filterung nach Untergrund (z. B. Asphalt vs. Schotter/Waldweg), damit die Route an das genutzte Fahrzeug angepasst werden kann.

Fortschrittsanzeige: Ein Dashboard, das den prozentualen Fortschritt der Abdeckung (Coverage) eines gespeicherten Polygons oder Waldstücks anzeigt.

Höhenprofil: Anzeige der Höhenmeter für die geplante Route, um die Intensität abschätzen zu können.

Multi-User & Future-Proofing:

Benutzerverwaltung: Das System benötigt eine Registrierung/Login (Benutzername & Passwort), damit das Coverage-Overlay und die Touren pro Nutzer gespeichert werden.

API-First: Die gesamte Kommunikation zwischen Frontend and Backend muss über eine saubere API laufen. In Zukunft wird eine native Android-App entwickelt (für Live-Navigation und Tracking), die auf exakt dieselben Backend-Endpunkte zugreifen muss.

---

# EveryPath - Product Definition

## Vision
EveryPath is a web-based routing and coverage application designed for completionists and outdoor enthusiasts (runners, cyclists, "Everesters") who aim to cover every single path or road within a defined area. Unlike traditional point-to-point navigation, EveryPath solves the Chinese Postman Problem to generate an efficient route that traverses every segment of a user-defined polygon at least once, with a specific focus on off-road trails and forest paths.

## Target Audience
- **Completionists/Everesters:** Individuals motivated by "mapping" or "completing" entire areas (e.g., CityStrides users).
- **Outdoor Enthusiasts:** Runners and cyclists who prefer off-road and forest environments over urban settings.
- **Off-road Focus:** While urban areas are supported, the tool is optimized for trail networks and forest tracks.

## Core Features
- **Polygon Area Selection:** Users can freely draw polygons on an interactive map (OpenStreetMap) to define their "patrol" area.
- **Intelligent Routing (CPP):** Generates the shortest possible path to cover every street/trail in the polygon.
- **Dead-end Toggle:** Option to include or ignore cul-de-sacs/dead-ends in the routing logic.
- **Coverage History Overlay:** Visual history of previously covered paths, integrated with new planning sessions.
- **Surface Filtering:** Distinguish between asphalt, gravel, and forest trails to adapt routes to specific vehicles (e.g., MTB vs. Road bike).
- **GPX Export:** One-click export for navigation on external devices (Garmin, Wahoo, Smartphone).
- **Multi-User Support:** Secure login and cloud storage for individual coverage maps and saved polygons.

## Success Metrics
- **Efficiency:** The primary goal is minimizing the total distance required to achieve 100% coverage of the defined area.
- **Coverage Accuracy:** Precision in mapping and identifying all path segments within complex forest or trail networks.
- **User Engagement:** Progress dashboards showing the percentage of "completed" polygons or forest patches.

## Platform and UX
- **Responsive Web App:** Optimized for both desktop planning and mobile viewing.
- **API-First Architecture:** Clean separation of concerns between the CPP engine and the UI to support future native mobile app development.
- **Containerized Development:** 100% Docker-based environment for seamless deployment and development.

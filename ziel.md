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

API-First: Die gesamte Kommunikation zwischen Frontend und Backend muss über eine saubere API laufen. In Zukunft wird eine native Android-App entwickelt (für Live-Navigation und Tracking), die auf exakt dieselben Backend-Endpunkte zugreifen muss.
# Orrery-Web

Standalone, dependency-free browser astronomical clock.

## Features

- Approximate heliocentric positions of all eight planets using linearized J2000 orbital elements and Kepler's equation.
- Schematic, tilted orbital rings with astronomical symbols.
- Local 12-hour clock and date.
- Earth–Moon inset with approximate synodic lunar phase and illumination.
- Date picker and one-day navigation.

## Accuracy

This is an illustrative astronomical visualization, **not** a precision ephemeris. Orbital rings are schematic and not distance-scaled. Lunar phase uses a fixed synodic period and reference new moon, not a full lunar orbit model. Planetary elements are approximate and most useful near the modern era.

## Local preview

Serve the repository with any static HTTP server, such as `python -m http.server 8000`, and open http://localhost:8000.

## Deployment

GitHub Actions publishes the repository to GitHub Pages. In repository Settings → Pages, set the deployment source to **GitHub Actions**.

Expected URL: https://daxmasta.github.io/Orrery-Web/

The main launcher is https://daxmasta.github.io/Mini-Apps/.

## AI Disclosure

This project was developed with the assistance of OpenAI's ChatGPT, including contributions to code generation, interface design, and debugging.

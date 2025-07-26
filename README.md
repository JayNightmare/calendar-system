<div align=center>

# Calendar App

This project is a simple yet feature-rich calendar application built with **React** and **react-big-calendar**. It allows you to create, view and manage events such as reminders, plans or other activities, all from a single interface.

</div>




## Features

* **Month/Week/Day/Agenda views** – switch between different calendar views using a drop-down selector. A subtle zoom animation plays when you change views.
* **Add events** – click and drag on the calendar to select a time range or use the “Add Event” button to open a form where you can enter event details.
* **Colour coded event types** – events are categorised as _Reminder_, _Plan_ or _Other_, each with its own colour for quick identification.
* **Search** – a search box at the top filters events by title in real time.
* **Filters** – toggle individual event types on or off to control which events are displayed.
* **Persistent storage** – events are saved to `localStorage`, so they remain on the calendar even after a page reload.
* **Deployable to GitHub Pages** – the project includes a `homepage` field and deployment script using the `gh-pages` package. Replace the `homepage` URL with your own repository URL before deploying.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

   The app will be served at `http://localhost:3000/` by default.

3. Build for production:

   ```bash
   npm run build
   ```

4. Deploy to GitHub Pages:

   * Update the `homepage` field in `package.json` to match your GitHub Pages URL (e.g. `https://<username>.github.io/<repository>`).
   * Run the deploy script:

     ```bash
     npm run deploy
     ```

This will build the project and push the contents of the `build` directory to the `gh-pages` branch of your repository.

## Customising event types

Event categories and their associated colours are defined in `src/App.js` within the `eventTypes` object. Feel free to modify or add new categories as needed. Each type requires a unique key, a display label and a colour value.

# Paath - Online learning website (front-end demo)

No backend. Accounts and progress are stored in the browser (localStorage).

## Run in VS Code
1. Unzip the folder and open it in VS Code (File > Open Folder).
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` > **Open with Live Server**.
   (You can also just double-click `index.html`.)

## Demo login
Press "Try the demo account", or sign up with any email.
Demo: demo@paath.app / demo1234

## Files
- `index.html`  - page structure (login, home, library shell)
- `css/style.css` - all styling, light and dark theme
- `js/data.js`  - courses, books and quiz questions (edit here to add content)
- `js/app.js`   - login, routing, home, course page, library, suggestions

## Add a course
Add an object to the `COURSES` array in `js/data.js`
(id, title, cat, by, level, hrs, rating, learners, pat, tags, desc, lessons, books).

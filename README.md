# Snakes & Ladders — History Quest

This is the complete static website project. It uses the supplied board image exactly as provided, with a separate movable token and touchscreen controls.

## Host it

Upload these four files together to the root of a static site, such as a GitHub Pages repository:

- index.html
- styles.css
- game.js
- reference-board.png

Do not rename or separate them. The page loads the script, stylesheet, and board image by their filenames.

For GitHub Pages:
1. Create a repository. On GitHub Free, the repository must be public for Pages.
2. Upload all four files to the repository root.
3. Open **Settings → Pages**.
4. Set the source to **Deploy from a branch**, choose main and root, then save.
5. After deployment finishes, copy the site URL shown on the Pages settings screen.

The game is a static site; it needs no build step or server. This project has not been published, so it does not yet have a live URL.

The tile subjects are fixed: red is History, blue is Geography, green is Political Science, and yellow is Economics. On landing, the card says only “It is a [subject] question.” The board snakes and ladder positions match the supplied reference.

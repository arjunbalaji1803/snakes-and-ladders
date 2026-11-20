# Snakes & Ladders

A touch-friendly static web game for a large touchscreen. It uses the supplied board image as its visual reference, with a separate movable player token. The top row is numbered 33 to 40 from left to right.

## Publish with GitHub Pages

Upload `index.html`, `styles.css`, `game.js`, and `reference-board.png` to the repository root, along with `.github/workflows/deploy.yml`. Set the repository's Pages source to **GitHub Actions**. Every push to `main` will deploy the site; wait for the Pages workflow to show a green check before opening the URL.

For this repository, the site URL is https://arjunbalaji1803.github.io/snakes-and-ladders/.

## Board and subjects

Choose 1–4 groups. Groups take turns in order (A, B, C, D), and the colored people tokens show each group's position. The score panel is manual: use −1, +1, or +5 for each group. Changing the group count starts a new game and resets positions and scores.

The board preserves the pictured snakes and ladders while matching their destinations: ladders go 5→22, 16→31, and 27→38; snakes go 35→12, 23→8, and 14→2. Landing naturally on 22 leaves the token there. Tile subjects are fixed: red is History, blue is Geography, green is Political Science, and yellow is Economics. A landing card says only “It is a [subject] question.”

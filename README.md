# PIXEL ELSEWHERE

A 20-level dead pixel hunting game that runs in your browser.
It works with just HTML, CSS, JavaScript, and images. No build step or server-side processing is required.

## Publish with GitHub Pages

1. Create a new public repository on GitHub. Example name: `pixel-elsewhere`.
2. Unzip this ZIP file.
3. In the repository, go to Add file → Upload files and upload the contents of the unzipped folder.
   Make sure `index.html` is at the top level of the repository and the `assets` folder is at the same level.
   Do not upload the ZIP itself or the outer folder.
4. Save with Commit changes.
5. Open Settings → Pages.
6. Set Source to Deploy from a branch, Branch to main, and the folder to / (root), then click Save.
7. When publishing is complete, open the game from Visit site on the same screen.

Example URL: https://Em-green.github.io/pixel-elsewhere/
With this procedure on the free plan, the repository is also public.

Official guides:
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Files

- `index.html`: page and game screen
- `style.css`: design
- `engine.js`: levels and hit detection
- `renderer.js`: backgrounds and drawing
- `audio.js`: small sound effects for correct and incorrect answers
- `game.js`: controls and game flow
- `assets/`: 6 background photos

To update the game, upload the changed files to GitHub and click Commit changes.
Updates to the GitHub Pages source are reflected on the site automatically.

## Sound effects

A short chime plays on a correct answer, and a subtle low buzzer plays on an incorrect one.
You can toggle sound with the Sound on / Sound off button at the top of the screen.
Nothing plays just from opening the page. There is no background music.
All sounds are generated in the browser, so no external audio files are needed.

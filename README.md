# Sum Monsters

Visit https://excaliburjs.com/sum-monsters/ to play!

## Prerequisites

- NodeJS 20.x
- Git

## Local Development

Updating your local copy with `git pull -r` to rebase your local commits on top of upstream, makes the `main` easy to follow and merges less difficult.

1. Clone the repo

        git clone https://github.com/excaliburjs/sum-monsters.git

2. Navigate into the root directory `sum-monsters` in your favorite command line tool

3. Run the install to download the tools:

        `npm install`

4. Build the project:

        `npm run build`

5. Run the game locally with parcel:

        `npm start`

6. Make your changes, commit directly to the 'main' branch, update your local copy with `git pull -r`, and then push to the remote repository.

7. If you run into weird caching issues where your updates aren't showing up when you run the game locally, stop the game and run `npm run clean` to clean out the `/dist` and the `/.parcel-cache` folders.

### Debugging tools

You can use the [Excalibur chrome extension](https://chromewebstore.google.com/detail/excalibur-dev-tools/dinddaeielhddflijbbcmpefamfffekc) to help with debugging.

# strudel

[![Strudel test status](https://github.com/tidalcycles/strudel/actions/workflows/test.yml/badge.svg)](https://github.com/tidalcycles/strudel/actions) [![DOI](https://zenodo.org/badge/450927247.svg)](https://doi.org/10.5281/zenodo.6659278)

An experiment in making a [Tidal](https://github.com/tidalcycles/tidal/) using web technologies. This software is a bit more stable now, but please continue to tread carefully.

- Try it here: <https://strudel.cc>
- Docs: <https://strudel.cc/learn>
- Technical Blog Post: <https://loophole-letters.vercel.app/strudel>
- 1 Year of Strudel Blog Post: <https://loophole-letters.vercel.app/strudel1year>
- 2 Years of Strudel Blog Post: <https://strudel.cc/blog/#year-2>

## Running Locally

It's a Strudel version which only uses local samples offline.

After cloning the project, you can run the REPL locally:

1. Install [Node.js](https://nodejs.org/)
2. Install [pnpm](https://pnpm.io/installation)
3. Install dependencies by running the following command:
   ```bash
   # from root of <your-strudel>
   pnpm i
   ```
4. Run the development server:
   ```bash
   # from root of <your-strudel>
   pnpm dev
   ```
5. Download samples to `<your-strudel>/samples` folder from <https://github.com/felixroos/dough-samples> <https://github.com/felixroos/webaudiofontdata>
6. Run the local samples server:
   ```bash
   # from root of <your-strudel>
   cd samples
   npx ../packages/sampler
   ```
7. Please refer to `<your-strudel>/samples/README.md` for how to load local samples in your code
## Using Strudel In Your Project

This project is organized into many [packages](./packages), which are also available on [npm](https://www.npmjs.com/search?q=%40strudel).

Read more about how to use these in your own project [here](https://strudel.cc/technical-manual/project-start).

You will need to abide by the terms of the [GNU Affero Public Licence v3](LICENSE.md). As such, Strudel code can only be shared within free/open source projects under the same license -- see the license for details.

Licensing info for the default sound banks can be found over on the [dough-samples](https://github.com/felixroos/dough-samples/blob/main/README.md) repository.

## Contributing

There are many ways to contribute to this project! See [contribution guide](./CONTRIBUTING.md).

<a href="https://github.com/tidalcycles/strudel/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=tidalcycles/strudel" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Community

There is a #strudel channel on the TidalCycles discord: <https://discord.com/invite/HGEdXmRkzT>

You can also ask questions and find related discussions on the tidal club forum: <https://club.tidalcycles.org/>

The discord and forum is shared with the haskell (tidal) and python (vortex) siblings of this project.

# samples folder

1. copy tidal-drum-machines, piano, Dirt-Samples, vcsl, mridangam, EmuSP12, and any other samples to this folder
2. run `npx ../packages/sampler` from this folder (not ~~`npx @strudel/sampler`~~) 
3. add code below to begining of your code
```js
let setupLocalSamples = async function () {
  let localSamplesRoot = 'http://localhost:5432/'
  samples(localSamplesRoot)
  return Promise.all([
    samples(localSamplesRoot + 'piano.json',
           undefined, {prebake: true}),
    samples(localSamplesRoot + 'vcsl.json',
           undefined, {prebake: true}),
    samples(localSamplesRoot + 'Dirt-Samples.json',
           undefined, {prebake: true}),
    samples(localSamplesRoot + 'tidal-drum-machines.json',
           undefined,
           {prebake: true, tag: 'drum-machines'}),
    samples(localSamplesRoot + 'EmuSP12.json',
           undefined,
           {prebake: true, tag: 'drum-machines'}),
    samples(localSamplesRoot + 'mridangam.json',
           undefined,
           {prebake: true, tag: 'drum-machines'}),

  ]).then( (result) => {
      aliasBank(localSamplesRoot 
                + 'tidal-drum-machines-alias.json')
  })
}
await setupLocalSamples()
```
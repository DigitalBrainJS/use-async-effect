### Changelog

All notable changes to this project will be documented in this file. Dates are displayed in UTC.

Generated by [`auto-changelog`](https://github.com/CookPete/auto-changelog).

#### [v0.12.2](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.12.1...v0.12.2)

- Expose cancel method for useAsyncEffect hook; [`662dfdc`](https://github.com/DigitalBrainJS/use-async-effect/commit/662dfdc2cc495e782ea1869b25edba895dec1b8d)

#### [v0.12.1](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.12.0...v0.12.1)

> 24 September 2021

- Fixed typings; [`18cd920`](https://github.com/DigitalBrainJS/use-async-effect/commit/18cd920ea4604b2f6c0b193e30afbefe24bfaae6)
- Fixed examples; [`81f20f3`](https://github.com/DigitalBrainJS/use-async-effect/commit/81f20f3afb86ff0fb6809b8f0516c41c46707ece)

#### [v0.12.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.11.5...v0.12.0)

> 19 September 2021

- Refactored `useDeepState` hook; [`eb83466`](https://github.com/DigitalBrainJS/use-async-effect/commit/eb834667e8a7c893f7ef073e61f6233784c1e4e5)

#### [v0.11.5](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.11.4...v0.11.5)

> 14 July 2021

- Added symbol props support for state created by `useAsyncDeepState` hook; [`c71507d`](https://github.com/DigitalBrainJS/use-async-effect/commit/c71507dac9624dda633c391a834cd6cb9267641b)

#### [v0.11.4](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.11.3...v0.11.4)

> 1 July 2021

- Refactored & optimized `useAsyncCallback` hook; [`20c2802`](https://github.com/DigitalBrainJS/use-async-effect/commit/20c28023c6f26e7aa2125e074973219589c93878)

#### [v0.11.3](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.11.2...v0.11.3)

> 27 May 2021

- Fixed .npmignore due to missing module typings; [`9d48443`](https://github.com/DigitalBrainJS/use-async-effect/commit/9d48443d70275973f4df050b41149bcc7be1758a)

#### [v0.11.2](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.11.1...v0.11.2)

> 23 May 2021

- Added the ability for `useAsyncWatcher` and `useAsyncDeepState` to unsubscribe from state updates; [`0915b17`](https://github.com/DigitalBrainJS/use-async-effect/commit/0915b177375a29c6948f4c8e9d1a236425beb5d8)

#### [v0.11.1](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.11.0...v0.11.1)

> 22 May 2021

- Fixed bug with affected initial state object of the `useAsyncDeepState` hook; [`2fde232`](https://github.com/DigitalBrainJS/use-async-effect/commit/2fde2327da6cd7935b2b50fd6b0073fa13fc5bdf)

#### [v0.11.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.10.0...v0.11.0)

> 22 May 2021

- Refactored `useAsyncState` to `useAsyncDeepState`; [`11eb17f`](https://github.com/DigitalBrainJS/use-async-effect/commit/11eb17f8d5b005e4d700c925f9afffbd09eab0a8)

#### [v0.10.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.9.4...v0.10.0)

> 17 May 2021

- Added `useAsyncState` and `useAsyncWatcher` hooks; [`861b2a4`](https://github.com/DigitalBrainJS/use-async-effect/commit/861b2a4d11f147049c9055d2b6dcd3001f30a0c5)
- Updated typings; [`45cb882`](https://github.com/DigitalBrainJS/use-async-effect/commit/45cb882a0e53fa568384d31d873a8dd469e4e624)

#### [v0.9.4](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.9.3...v0.9.4)

> 15 May 2021

- Refactored useAsyncEffect hook; [`b62ea48`](https://github.com/DigitalBrainJS/use-async-effect/commit/b62ea48653db2199f742a7ea206940aa82beed0c)

#### [v0.9.3](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.9.2...v0.9.3)

> 14 May 2021

- Refactored the internal finalize logic of the useAsyncCallback hook; [`fe20f5f`](https://github.com/DigitalBrainJS/use-async-effect/commit/fe20f5f59718366535ed43a9fbba3b486c513b90)

#### [v0.9.2](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.9.1...v0.9.2)

> 13 May 2021

- Added `catchErrors` option for the `useAsyncCallbackHook`; [`377bc1a`](https://github.com/DigitalBrainJS/use-async-effect/commit/377bc1acc0671bb0aa7b4f64c387ef84b9826f78)
- Refactored isGeneratorFn to avoid using function name; [`390fdd6`](https://github.com/DigitalBrainJS/use-async-effect/commit/390fdd609c5c1ccfa0d52ff4f2b64b4f6ed18cb3)

#### [v0.9.1](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.9.0...v0.9.1)

> 12 May 2021

- Fixed queueSize bug; [`071b3a2`](https://github.com/DigitalBrainJS/use-async-effect/commit/071b3a295244465292a08caa1df7bec140fa960e)

#### [v0.9.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.8.0...v0.9.0)

> 9 May 2021

- Improved `useAsyncCallback` queue logic; [`aa6e76b`](https://github.com/DigitalBrainJS/use-async-effect/commit/aa6e76bd8e5a83b05ee65c7d1b2f7c0dcb03390f)

#### [v0.8.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.7.1...v0.8.0)

> 7 May 2021

- Updated dependencies; [`a69597a`](https://github.com/DigitalBrainJS/use-async-effect/commit/a69597ad047d69bb09803bc7f48d78b4d170efd8)

#### [v0.7.1](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.7.0...v0.7.1)

> 5 May 2021

- Updated dependencies; [`a7ec761`](https://github.com/DigitalBrainJS/use-async-effect/commit/a7ec7612833003c60c6bc4786de81cf5c827d4fa)

#### [v0.7.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.6.0...v0.7.0)

> 3 May 2021

- Added internal states support; [`1b7a703`](https://github.com/DigitalBrainJS/use-async-effect/commit/1b7a703f2516dc82b13d872b3169cf2e795efbcb)

#### [v0.6.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.5.0...v0.6.0)

> 27 April 2021

- Updated c-promise2 to v0.12.1; [`9a1863e`](https://github.com/DigitalBrainJS/use-async-effect/commit/9a1863e97cf6f5ad86c5f4c6d713d01f92d0a187)

#### [v0.5.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.4.0...v0.5.0)

> 13 April 2021

- Added `scopeArg` option for `useAsyncCallback` hook; [`af1ff83`](https://github.com/DigitalBrainJS/use-async-effect/commit/af1ff836c10daa19237493b6b3d16b44bda0c0aa)
- Updated c-promise2 to v0.11.2; [`a5624bd`](https://github.com/DigitalBrainJS/use-async-effect/commit/a5624bdaa45e335d1dfd73dc99cb0f8b377b2cc1)
- Fixed build status badge; [`190daa2`](https://github.com/DigitalBrainJS/use-async-effect/commit/190daa2af2e8547c7fd1be0d4311c647c4c9bd6f)
- Fixed build status badge - use travis-ci.com instead .org; [`ed67075`](https://github.com/DigitalBrainJS/use-async-effect/commit/ed670752698106578316ebe2c80fd6ddde1c5140)

#### [v0.4.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.3.0...v0.4.0)

> 11 January 2021

- Added `queueSize` option for `useAsyncEffect`; [`0436e46`](https://github.com/DigitalBrainJS/use-async-effect/commit/0436e46fc55309ccf5965221ba6389356e1b2259)

#### [v0.3.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.2.1...v0.3.0)

> 7 January 2021

- Fixed bug with useAsyncEffect user cancellation; [`3ccd038`](https://github.com/DigitalBrainJS/use-async-effect/commit/3ccd03813d0b7e01132118de660f2b030967389e)

#### [v0.2.1](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.2.0...v0.2.1)

> 6 January 2021

- Fixed demo links in the README.md; [`1cb5f11`](https://github.com/DigitalBrainJS/use-async-effect/commit/1cb5f11a5dc035d2755b8638b9844d726521f481)
- Added typings config to the package.json; [`481afc8`](https://github.com/DigitalBrainJS/use-async-effect/commit/481afc81612fe7c01b516cb11b9b8f084d63d3b1)

#### [v0.2.0](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.1.2...v0.2.0)

> 6 January 2021

- Added useAsyncCallback hook; [`baca6a7`](https://github.com/DigitalBrainJS/use-async-effect/commit/baca6a73792cf47262f3a21eade60600ba8cf877)
- spellcheck; [`34c70ea`](https://github.com/DigitalBrainJS/use-async-effect/commit/34c70ea037f9e592a3d1f039948bf588e68dac6c)

#### [v0.1.2](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.1.1...v0.1.2)

> 5 January 2021

- Added console.error for catch handler; [`df9b78f`](https://github.com/DigitalBrainJS/use-async-effect/commit/df9b78fa77a0a823436d96f7a14c80bcbe972fdc)

#### [v0.1.1](https://github.com/DigitalBrainJS/use-async-effect/compare/v0.1.0...v0.1.1)

> 5 January 2021

- Refactored package.json; [`3a7253a`](https://github.com/DigitalBrainJS/use-async-effect/commit/3a7253a9726f4f65acc0164838f226c81ff2ca8f)
- Added prepublishOnly & postversion scripts; [`40ebb4d`](https://github.com/DigitalBrainJS/use-async-effect/commit/40ebb4d0c20834121645b16bcedeb4f719092df3)
- Renamed package; [`a0d6894`](https://github.com/DigitalBrainJS/use-async-effect/commit/a0d68945bc10c165a93aea0271a10a01b651c15c)

#### v0.1.0

> 5 January 2021

- Initial commit [`5529feb`](https://github.com/DigitalBrainJS/use-async-effect/commit/5529febb3c24fb3d6f1dccc1bd210e9f6e88bf26)
- Improved README.md; [`a0a7144`](https://github.com/DigitalBrainJS/use-async-effect/commit/a0a7144ef707085e879f828d49620761227dba0b)
- Refactored; [`590756c`](https://github.com/DigitalBrainJS/use-async-effect/commit/590756c6dbd7053200c8c46a49bd9bb1d76716b1)

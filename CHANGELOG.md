# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.4.0] - 2021-01-11

### Added 
- `queueSize` option for `useAsyncEffect`;

### Updated
- reworked `cancelPrevious` and `combine` logic;

## [0.3.0] - 2021-01-07

### Fixed
- Bug with `useAsyncEffect` user cancellation;

## [0.2.0] - 2021-01-06

### Added 
- `useAsyncCallback` hook
- typings

### Updated
- `useAsyncEffect` now returns a cancel function directly instead of an array with it.

## [0.1.0] - 2021-01-04

### Added
- initial version

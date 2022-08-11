## [3.2.0](https://github.com/unlight/prisma-query-log/compare/v3.1.1...v3.2.0) (2022-08-11)


### Features

* Added event duration ([9e61ca0](https://github.com/unlight/prisma-query-log/commit/9e61ca0ecffd866f8389cafa9c06d9cb3eddfb16)), closes [#5](https://github.com/unlight/prisma-query-log/issues/5)

### [3.1.1](https://github.com/unlight/prisma-query-log/compare/v3.1.0...v3.1.1) (2022-03-18)


### Bug Fixes

* Safe parse parameters ([461dee0](https://github.com/unlight/prisma-query-log/commit/461dee0f44a700de751acfb6693ee6b903e97955)), closes [#4](https://github.com/unlight/prisma-query-log/issues/4)

## [3.1.0](https://github.com/unlight/prisma-query-log/compare/v3.0.2...v3.1.0) (2021-12-21)


### Features

* Support postgres ([2ad66c2](https://github.com/unlight/prisma-query-log/commit/2ad66c250e492f2124884149987b942d95b5bc41))

### [3.0.2](https://github.com/unlight/prisma-query-log/compare/v3.0.1...v3.0.2) (2021-10-19)


### Bug Fixes

* Date parsing when timestamp has no decimals ([4655519](https://github.com/unlight/prisma-query-log/commit/46555198f83ae7175cbcec256b8dc8c647de67d9)), closes [#3](https://github.com/unlight/prisma-query-log/issues/3)

### [3.0.1](https://github.com/unlight/prisma-query-log/compare/v3.0.0...v3.0.1) (2021-04-25)


### Bug Fixes

* Added github home page link to package json ([3c3b8b4](https://github.com/unlight/prisma-query-log/commit/3c3b8b4f13e630d93ec42e443426a9bb045b0810)), closes [#1](https://github.com/unlight/prisma-query-log/issues/1) [#2](https://github.com/unlight/prisma-query-log/issues/2)

# [3.0.0](https://github.com/unlight/prisma-query-log/compare/v2.1.0...v3.0.0) (2021-02-12)


### Features

* Made configuration flatten ([4dac682](https://github.com/unlight/prisma-query-log/commit/4dac68291d3d36febefa72c6550218b98b79b11c))


### BREAKING CHANGES

* Interface of configutation is changed, now it is flat

# [2.1.0](https://github.com/unlight/prisma-query-log/compare/v2.0.3...v2.1.0) (2021-02-11)


### Features

* Improved format of where in (?) statement ([cf87b9d](https://github.com/unlight/prisma-query-log/commit/cf87b9dc557e7cf68b632642db469290ec7ce17e))

## [2.0.3](https://github.com/unlight/prisma-query-log/compare/v2.0.2...v2.0.3) (2021-01-22)


### Bug Fixes

* No new line on formatted query ([44f4f2a](https://github.com/unlight/prisma-query-log/commit/44f4f2a21a713d9ac4bccb4db58deefa10d234b3))

## [2.0.2](https://github.com/unlight/prisma-query-log/compare/v2.0.1...v2.0.2) (2021-01-14)


### Bug Fixes

* Long parameters are not line breaking ([fcc7e1b](https://github.com/unlight/prisma-query-log/commit/fcc7e1b7cc7d4c7745667302954f2f8ab4bf23e3))

## [2.0.1](https://github.com/unlight/prisma-query-log/compare/v2.0.0...v2.0.1) (2021-01-14)


### Bug Fixes

* Improve sql formatter ([f51ec9a](https://github.com/unlight/prisma-query-log/commit/f51ec9a372ea2a60721c3d0b7c6c488125aabf52))

# [2.0.0](https://github.com/unlight/prisma-query-log/compare/v1.2.0...v2.0.0) (2021-01-13)


### Features

* Replaced sql formatter ([4bc158c](https://github.com/unlight/prisma-query-log/commit/4bc158cd909a192d133c18d1cf628c746b625826))


### BREAKING CHANGES

* Replaced sql formatter by https://github.com/gwax/sql-formatter

# [1.2.0](https://github.com/unlight/prisma-query-log/compare/v1.1.2...v1.2.0) (2021-01-13)


### Features

* Option to format query ([ec26a8e](https://github.com/unlight/prisma-query-log/commit/ec26a8e7745ba542ad8628fa67f200df34cc693e))

## [1.1.2](https://github.com/unlight/prisma-query-log/compare/v1.1.1...v1.1.2) (2020-12-25)


### Bug Fixes

* Unescape single fields ([12de9c1](https://github.com/unlight/prisma-query-log/commit/12de9c10c8e254d1023a49e4a9eec749866a7199))

## [1.1.1](https://github.com/unlight/prisma-query-log/compare/v1.1.0...v1.1.1) (2020-12-25)


### Bug Fixes

* Parse date parameter ([f41d4d5](https://github.com/unlight/prisma-query-log/commit/f41d4d580474100b82506a237f2e1849c4cf2cc1))

# [1.1.0](https://github.com/unlight/prisma-query-log/compare/v1.0.0...v1.1.0) (2020-12-25)


### Features

* Colorize parameters ([e290129](https://github.com/unlight/prisma-query-log/commit/e2901293b69366036aa9eb6829f9497a33b2c7c4))

# 1.0.0 (2020-12-25)


### Features

* First release ([5069929](https://github.com/unlight/prisma-query-log/commit/506992996116cdd45bcd2416362edc1ef1810a99))

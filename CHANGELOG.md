# Changelog

All notable changes to the SQL Notebook Kernel extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-17

### Added
- Initial release of SQL Notebook Kernel extension
- SQL Kernel implementation for Jupyter notebooks in VS Code
- SQL Server connection support using mssql driver
- Query execution with result formatting
- Support for multiple result sets
- Batch query execution with GO statement support
- Query cancellation support
- Configurable settings:
  - Default connection string
  - Query timeout
  - Maximum rows to display
  - IntelliSense toggle
- Connection pooling for efficient resource usage
- Error handling with detailed stack traces
- Markdown table formatting for query results
- Logging output channel for debugging
- Comprehensive test suite with integration tests
- GitHub Actions CI/CD pipeline with SQL Server container testing
- Extension packaging and release automation
- Documentation and usage examples

### Technical Features
- TypeScript implementation
- Webpack bundling
- ESLint for code quality
- Mocha test framework
- VS Code Test Runner integration
- Multi-platform support (Windows, macOS, Linux)
- Integration tests against SQL Server 2022 container

### Fixed
- Fixed GitHub Actions test execution with proper xvfb setup
- Added SQL Server container for integration testing in CI/CD

## [Unreleased]

### Planned Features
- IntelliSense/autocomplete for SQL queries
- Connection profile management
- Support for other database types (PostgreSQL, MySQL)
- Query history
- Export results to CSV/Excel
- Chart visualizations
- Transaction management UI
- Schema browser
- Query snippets
- Performance metrics display

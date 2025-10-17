# SQL Notebook Kernel for Visual Studio Code

A Visual Studio Code extension that provides a Jupyter kernel for executing SQL queries against SQL Server databases, similar to Azure Data Studio notebooks.

## Features

- **SQL Kernel for Notebooks**: Execute SQL queries directly in VS Code notebooks
- **SQL Server Support**: Connect to SQL Server databases using connection strings
- **Multiple Result Sets**: View and format multiple result sets from queries
- **Batch Support**: Execute multiple SQL statements separated by GO
- **Query Cancellation**: Cancel long-running queries
- **Formatted Output**: Results displayed as markdown tables in notebook cells
- **Error Handling**: Clear error messages with stack traces
- **Configurable Settings**: Customize timeout, max rows, and connection defaults

## Installation

### From VSIX Package

1. Download the latest `.vsix` file from the [Releases](https://github.com/saulens22/sql-notebook-kernel/releases) page
2. In VS Code, open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Click the "..." menu and select "Install from VSIX..."
4. Select the downloaded `.vsix` file

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/saulens22/sql-notebook-kernel.git
   cd sql-notebook-kernel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run compile
   ```

4. Press `F5` in VS Code to launch the extension in debug mode

## Usage

### Creating a SQL Notebook

1. Create a new Jupyter notebook in VS Code (`.ipynb` file)
2. Select "SQL Kernel" as the kernel from the kernel picker in the top-right
3. Create a new cell and set the language to SQL
4. Write your SQL query and execute the cell

### Configuration

Configure the extension in VS Code settings:

```json
{
  "sqlNotebook.defaultConnectionString": "Server=localhost;Database=mydb;User Id=sa;Password=mypassword;Encrypt=true;TrustServerCertificate=true",
  "sqlNotebook.queryTimeout": 30000,
  "sqlNotebook.maxRows": 1000,
  "sqlNotebook.enableIntelliSense": true
}
```

#### Configuration Options

- **`sqlNotebook.defaultConnectionString`**: Default SQL Server connection string
- **`sqlNotebook.queryTimeout`**: Query timeout in milliseconds (default: 30000)
- **`sqlNotebook.maxRows`**: Maximum number of rows to display (default: 1000)
- **`sqlNotebook.enableIntelliSense`**: Enable IntelliSense for SQL (default: true)

### Connection String Format

The extension uses standard SQL Server connection strings:

```
Server=myserver;Database=mydb;User Id=myuser;Password=mypassword;Encrypt=true;TrustServerCertificate=true
```

For Windows Authentication:
```
Server=myserver;Database=mydb;Integrated Security=true;TrustServerCertificate=true
```

### Example Queries

See the [examples/sample-queries.ipynb](examples/sample-queries.ipynb) notebook for a complete example.

**Simple SELECT:**
```sql
SELECT * FROM Users WHERE Active = 1;
```

**Multiple Statements with GO:**
```sql
SELECT COUNT(*) FROM Orders;
GO
SELECT TOP 10 * FROM Orders ORDER BY OrderDate DESC;
```

**Data Modification:**
```sql
UPDATE Products SET Price = Price * 1.1 WHERE Category = 'Electronics';
```

## Development

### Prerequisites

- Node.js 18.x or 20.x
- Visual Studio Code 1.85.0 or higher
- SQL Server (for testing)

### Building

```bash
npm install
npm run compile
```

### Testing

Run unit tests:
```bash
npm test
```

Run integration tests with SQL Server:
```bash
# Start SQL Server (e.g., using Docker)
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name mssql \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Set connection string and run tests
export SQL_CONNECTION_STRING="Server=localhost;Database=master;User Id=sa;Password=YourStrong@Passw0rd;Encrypt=true;TrustServerCertificate=true"
npm test
```

The CI/CD pipeline automatically runs integration tests against a SQL Server container on every push.

### Linting

```bash
npm run lint
```

### Packaging

```bash
npm install -g @vscode/vsce
vsce package
```

## Architecture

The extension follows a modular architecture:

- **`src/extension.ts`**: Extension entry point
- **`src/kernel/`**: Kernel implementation
  - `sqlKernel.ts`: Main kernel logic
  - `kernelProvider.ts`: Kernel registration
  - `connectionManager.ts`: Connection pooling
- **`src/execution/`**: Query execution
  - `queryExecutor.ts`: SQL query execution
  - `resultFormatter.ts`: Result formatting
- **`src/utils/`**: Utilities
  - `logger.ts`: Logging functionality

## Inspiration

This extension is inspired by [Azure Data Studio](https://github.com/microsoft/azuredatastudio) notebooks and aims to bring similar SQL notebook functionality to Visual Studio Code.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## References

- [VS Code Notebook API](https://code.visualstudio.com/api/extension-guides/notebook)
- [Jupyter Kernel Protocol](https://jupyter-client.readthedocs.io/en/stable/messaging.html)
- [node-mssql Documentation](https://www.npmjs.com/package/mssql)
- [Azure Data Studio](https://github.com/microsoft/azuredatastudio)

## Troubleshooting

### Extension not activating

Ensure you have a Jupyter notebook open (`.ipynb` file) to trigger extension activation.

### Connection errors

- Verify your connection string is correct
- Check that SQL Server is running and accessible
- Ensure firewall rules allow connections
- For SSL/TLS errors, set `TrustServerCertificate=true` in the connection string

### Query timeout

Increase the timeout in settings:
```json
{
  "sqlNotebook.queryTimeout": 60000
}
```

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/saulens22/sql-notebook-kernel/issues) page.

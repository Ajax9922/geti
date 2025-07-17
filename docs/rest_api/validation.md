# REST API Documentation Validation

This document explains the validation process for the REST API documentation in the `docs/rest_api` directory.

## Validation Tools

The REST API documentation is validated using two tools:

1. **Swagger CLI** - Validates the OpenAPI specification for syntax errors and schema compliance
2. **Spectral** - Provides more comprehensive linting and validation against best practices

## GitHub Actions Workflow

A GitHub Actions workflow automatically validates all YAML/JSON files in the REST API documentation when:
- Changes are pushed to the `main` branch that affect files in the `docs/rest_api` directory
- Pull requests are created or updated that affect files in the `docs/rest_api` directory

The workflow is defined in `.github/workflows/spectral-openapi-validation.yml` and uses Spectral to lint all YAML, YML, and JSON files in the `docs/rest_api` directory.

If validation fails on a pull request, the workflow will add a comment to the PR with details about the failure.

## Pre-commit Hook

A pre-commit hook is configured to validate the REST API documentation locally before committing changes. This helps catch issues early in the development process.

To use the pre-commit hook:

1. Install pre-commit: `pip install pre-commit`
2. Install the hooks: `pre-commit install`
3. The hooks will run automatically when you commit changes

You can also run the hooks manually on all files:

```bash
pre-commit run --all-files
```

Or run the Spectral linting hook specifically, which will validate all YAML/JSON files in the `docs/rest_api` directory:

```bash
pre-commit run spectral-lint
```

You can still run hooks on specific files if needed:

```bash
pre-commit run --files docs/rest_api/openapi.yaml
```

## Spectral Configuration

Spectral is configured to use a simple JSON ruleset file (`.spectral.json`) that extends the standard OpenAPI ruleset and is set to validate OpenAPI 3.x format. This approach provides a clean, maintainable configuration while keeping the ruleset definition separate from the command-line arguments.

## Adding or Modifying REST API Documentation

When adding or modifying REST API documentation:

1. Make your changes to the appropriate files in the `docs/rest_api` directory
2. Run the pre-commit hooks locally to validate your changes
3. Fix any validation errors before committing
4. Create a pull request
5. The GitHub Actions workflow will validate your changes again

## Troubleshooting

If you encounter validation errors:

1. Check the error message to understand what rule is being violated
2. Refer to the [Spectral documentation](https://meta.stoplight.io/docs/spectral/e5b9616d6d50c-spectral-cli) for information about specific rules
3. Fix the issues in your OpenAPI specification
4. Run the validation again to confirm the issues are resolved
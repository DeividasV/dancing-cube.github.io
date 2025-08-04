# Development Scripts

This directory contains utility scripts for managing the Dancing Cube exhibitions.

## Scripts

- **create_exhibition.sh** - Creates a new exhibition with the basic structure and template files
- **generate_exhibition.sh** - Generates exhibition files from templates
- **test_exhibitions.sh** - Tests all exhibitions to ensure they load properly
- **verify_exhibitions.sh** - Verifies the integrity and structure of existing exhibitions

## Usage

All scripts should be run from the project root directory:

```bash
# Create a new exhibition
./scripts/create_exhibition.sh exhibition-name

# Test all exhibitions
./scripts/test_exhibitions.sh

# Verify exhibitions
./scripts/verify_exhibitions.sh
```

## Note

These scripts are for development purposes only and are not needed for the production website.

# Shotbuzz UI & API Automation Framework

This repository contains the automated test suite for the **Shotbuzz** application. The framework is built using **Playwright** with a hybrid approach that combines UI and API testing to ensure maximum coverage and execution speed.

## 🚀 Key Features

- **Hybrid Testing:** Integration of UI interactions with direct API calls for efficient data setup and validation.
- **Page Object Model (POM):** Scalable and maintainable architecture for UI elements and actions.
- **Data Factory Pattern:** Centralized management of test payloads for consistent and reusable data sets.
- **Cross-Browser Testing:** Configured to run across Chromium, Firefox, and WebKit.
- **Rich Reporting:** Integrated HTML reports with screenshots and video recordings on failure.

## 🛠️ Tech Stack

- **Testing Framework:** [Playwright](https://playwright.dev/)
- **Language:** JavaScript
- **Environment:** Node.js
- **Reporting:** Playwright HTML Reporter / Custom Reports

## 📂 Project Structure

```text
├── tests/              # Test specifications (Spec files)
│   ├── smoke/          # Critical path tests
│   └── regression/     # Full functional test suite
├── pages/              # Page Object models for UI components
├── utils/              # Helper functions and shared logic
├── fixtures/           # Custom Playwright fixtures
├── test-data/          # JSON payloads and data factories
├── playwright.config.js # Global configuration
└── package.json        # Dependencies and test scripts
```

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- Git

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/naveencoderepo-star/shotbuzz-ui-api-automation.git
cd shotbuzz-ui-api-automation
npm install
npx playwright install
```

## 🏃 Running Tests

### Run all tests
```bash
npx playwright test
```

### Run a specific test file
```bash
npx playwright test tests/shotbuzz.spec.js
```

### Run tests in headed mode
```bash
npx playwright test --headed
```

### View test report
```bash
npx playwright show-report
```

## 📊 Environment Configuration
The project is currently configured to run against:
- **Base URL:** `https://shotbuzz-dev.coherentpixels.com`

---
*Created and maintained by @naveencoderepo-star*

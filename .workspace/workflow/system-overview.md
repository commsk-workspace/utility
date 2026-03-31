# DevTools Utility — System Overview

> Updated: 2026-03-31

## Architecture

```mermaid
flowchart TD
    subgraph Frontend["Frontend (Next.js 14 App Router)"]
        HOME["Home / Dashboard"]
        
        subgraph Featured["Featured Tools"]
            MERMAID["Mermaid Editor"]
            MARKDOWN["Markdown Editor"]
        end
        
        subgraph DataTools["Data & Format Tools"]
            JSON["JSON Tools"]
            SQL["SQL Tools"]
            CONVERTER["Data Converter"]
            CSV["CSV Tools"]
            YAML["YAML Tools"]
            BASE64["Base64"]
            MINIFY["Minifier"]
            URL["URL Tools"]
        end
        
        subgraph TextTools["Text & Code Tools"]
            TEXT["Text Tools"]
            DIFF["Diff Checker"]
            REGEX["Regex Tester"]
            API_TEST["API Tester"]
            SVG["SVG Optimizer"]
        end
        
        subgraph CryptoTools["Crypto & Security"]
            CRYPTO["Crypto Tools"]
            JWT["JWT Decoder"]
            PASSWORD["Password Generator"]
        end
        
        subgraph DesignTools["Color & Design"]
            COLOR["Color Tools"]
            GRADIENT["Gradient Generator"]
        end
        
        subgraph UtilTools["Utility"]
            LOREM["Lorem Ipsum"]
            IMAGE["Image Optimizer"]
            PLACEHOLDER["Placeholder Gen"]
        end
        
        subgraph SharedComponents["Shared Components"]
            MONACO["Monaco Editor"]
            SHARE_BTN["Share Button/Dialog"]
            HISTORY["History Panel"]
            THEME["Theme Provider"]
        end
    end
    
    subgraph API["API Layer (Next.js API Routes)"]
        DOC_API["POST/GET /api/documents"]
        DOC_ID_API["GET/PUT /api/documents/:id"]
        VERIFY_API["POST /api/documents/:id/verify"]
        VERSION_API["GET /api/documents/:id/versions"]
    end
    
    subgraph Database["Database (MySQL/PostgreSQL)"]
        DOC_TABLE["Document"]
        VER_TABLE["Version"]
    end
    
    subgraph Storage["Client Storage"]
        LOCAL_STORAGE["LocalStorage (History/Settings)"]
    end

    HOME --> Featured & DataTools & TextTools & CryptoTools & DesignTools & UtilTools
    
    MERMAID & MARKDOWN --> SHARE_BTN
    SHARE_BTN --> DOC_API
    DOC_API --> DOC_TABLE
    DOC_TABLE --> VER_TABLE
    DOC_ID_API --> DOC_TABLE
    VERIFY_API --> DOC_TABLE
    VERSION_API --> VER_TABLE
    
    JSON & SQL & TEXT --> HISTORY
    HISTORY --> LOCAL_STORAGE
    
    MERMAID & MARKDOWN & JSON & SQL --> MONACO
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.15 (App Router) |
| Language | TypeScript 5.6.3 |
| UI | Tailwind CSS + Radix UI + shadcn/ui |
| Editor | Monaco Editor |
| Database | MySQL / PostgreSQL via Prisma 5.22 |
| Diagrams | Mermaid 11.3 |
| Auth (Docs) | bcryptjs (password-protected sharing) |
| Deploy | PM2 process manager |
| Domain | util.commsk.dev |

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS as Next.js (SSR + API)
    participant DB as Database

    User->>Browser: Use tool (format/convert/generate)
    Browser->>Browser: Process locally (no API needed)
    Browser->>Browser: Save to LocalStorage (history)
    
    User->>Browser: Click "Share"
    Browser->>NextJS: POST /api/documents
    NextJS->>DB: Insert Document + Version
    DB-->>NextJS: Document ID
    NextJS-->>Browser: Share URL

    User->>Browser: Open shared link
    Browser->>NextJS: GET /api/documents/:id
    NextJS->>DB: Fetch Document
    alt Password Protected
        NextJS-->>Browser: Requires password
        Browser->>NextJS: POST /api/documents/:id/verify
        NextJS-->>Browser: Document content
    else Public
        NextJS-->>Browser: Document content
    end
```

## Module Count: 25 Tools

| Category | Tools | Count |
|----------|-------|-------|
| Featured | Mermaid, Markdown | 2 |
| Data & Format | JSON, SQL, Converter, CSV, YAML, Base64, Minify, URL | 8 |
| Text & Code | Text, Diff, Regex, API Tester, SVG | 5 |
| Crypto & Security | Crypto, JWT, Password | 3 |
| Color & Design | Color, Gradient | 2 |
| Utility | Lorem Ipsum, Image, Placeholder | 3 |
| Share/View | Share page | 1 |
| **Total** | | **24 + 1 (home)** |

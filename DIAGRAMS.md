# Smart Crop Aid - Software Engineering Diagrams

> UML and System Diagrams for Smart Crop Aid Application

---

## Table of Contents
1. [Use Case Diagram](#1-use-case-diagram)
2. [Entity-Relationship (ER) Diagram](#2-entity-relationship-er-diagram)
3. [Sequence Diagrams](#3-sequence-diagrams)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Class Diagram](#5-class-diagram)
6. [Activity Diagrams](#6-activity-diagrams)
7. [Object Diagram](#7-object-diagram)

---

## 1. Use Case Diagram

```mermaid
flowchart TB
    subgraph System["Smart Crop Aid System"]
        UC1["Register/Login"]
        UC2["Detect Pest/Disease"]
        UC3["Get Crop Recommendations"]
        UC4["View Market Prices"]
        UC5["View Weather"]
        UC6["Access Help Center"]
        UC7["Manage Profile"]
        UC8["View Reports History"]
        
        UC9["Manage Users"]
        UC10["View All Reports"]
        UC11["Add Market Prices"]
        UC12["View Statistics"]
        UC13["View Recommendations"]
    end
    
    Farmer((Farmer))
    Admin((Admin))
    MLSystem[/"ML API System"/]
    WeatherAPI[/"Weather API"/]
    
    Farmer --> UC1
    Farmer --> UC2
    Farmer --> UC3
    Farmer --> UC4
    Farmer --> UC5
    Farmer --> UC6
    Farmer --> UC7
    Farmer --> UC8
    
    Admin --> UC1
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    
    UC2 -.-> MLSystem
    UC5 -.-> WeatherAPI
```

### Use Case Descriptions

| ID | Use Case | Actor | Description |
|----|----------|-------|-------------|
| UC1 | Register/Login | Farmer, Admin | User authentication and account creation |
| UC2 | Detect Pest/Disease | Farmer | Upload crop image for AI analysis |
| UC3 | Get Crop Recommendations | Farmer | Get personalized crop suggestions |
| UC4 | View Market Prices | Farmer | Browse commodity prices |
| UC5 | View Weather | Farmer | Get location-based weather data |
| UC6 | Access Help Center | Farmer | View FAQs and farming tips |
| UC7 | Manage Profile | Farmer | Update account settings |
| UC8 | View Reports History | Farmer | View past pest detection reports |
| UC9 | Manage Users | Admin | Ban/unban user accounts |
| UC10 | View All Reports | Admin | View all pest reports system-wide |
| UC11 | Add Market Prices | Admin | Add/update commodity prices |
| UC12 | View Statistics | Admin | View system usage statistics |
| UC13 | View Recommendations | Admin | View all saved recommendations |

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ CROPS : owns
    USERS ||--o{ PEST_REPORTS : creates
    USERS ||--o{ CROP_RECOMMENDATIONS : saves
    USERS ||--o{ NOTIFICATIONS : receives
    CROPS ||--o{ PEST_REPORTS : has
    
    USERS {
        char(36) id PK
        varchar(255) email UK
        varchar(255) password_hash
        varchar(255) name
        varchar(20) phone
        enum role
        boolean is_banned
        varchar(255) location
        decimal farm_size
        decimal farm_lat
        decimal farm_lng
        text profile_image_url
        timestamp created_at
        timestamp updated_at
        timestamp last_active
    }
    
    
    CROPS {
        char(36) id PK
        char(36) user_id FK
        varchar(100) crop_name
        varchar(100) variety
        date planting_date
        date expected_harvest_date
        date actual_harvest_date
        enum status
        decimal area
        varchar(100) soil_type
        varchar(100) irrigation_type
        text notes
        decimal yield_amount
        varchar(20) yield_unit
        timestamp created_at
        timestamp updated_at
    }
    
    PEST_REPORTS {
        char(36) id PK
        char(36) user_id FK
        char(36) crop_id FK
        text image_url
        varchar(100) pest_name
        decimal confidence
        enum severity
        text description
        text ai_analysis
        text treatment_recommended
        enum treatment_status
        decimal lat
        decimal lng
        timestamp created_at
    }
    
    CROP_RECOMMENDATIONS {
        char(36) id PK
        char(36) user_id FK
        varchar(50) soil_type
        varchar(20) water_level
        varchar(20) season
        text recommendations_json
        timestamp created_at
    }
    
    MARKET_PRICES {
        char(36) id PK
        varchar(100) crop_name
        varchar(100) variety
        decimal price
        varchar(20) unit
        varchar(100) market_name
        varchar(255) location
        varchar(100) region
        date date
        enum trend
        decimal change_percentage
        timestamp created_at
    }
    
    NOTIFICATIONS {
        char(36) id PK
        char(36) user_id FK
        varchar(255) title
        text message
        enum type
        boolean is_read
        text action_url
        timestamp created_at
    }
```

---

## 3. Sequence Diagrams

### 3.1 User Authentication Sequence

```mermaid
sequenceDiagram
    participant U as User (Mobile App)
    participant F as Frontend
    participant B as Backend API (Vercel)
    participant DB as PostgreSQL (Neon)
    
    U->>F: Enter credentials
    F->>B: POST /api/auth/login
    B->>DB: SELECT user WHERE email=$1
    DB-->>B: User record
    B->>B: Verify password (bcrypt)
    alt Password Valid
        B->>B: Generate JWT token
        B-->>F: {token, user}
        F->>F: Store token (AsyncStorage)
        F-->>U: Navigate to Home
    else Password Invalid
        B-->>F: {error: "Invalid credentials"}
        F-->>U: Show error message
    end
```

### 3.2 Pest Detection Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant CL as Cloudinary
    participant ML as Flask ML API
    participant DB as PostgreSQL
    
    U->>F: Select/Capture image
    F->>F: Validate leaf image
    F->>B: POST /api/upload (FormData)
    B->>CL: Upload stream
    CL-->>B: {secure_url: "https://res.clo..."}
    B-->>F: {url: "https://res.clo..."}
    
    F->>ML: POST /api/predict (base64 image)
    ML->>ML: Preprocess image (160x160)
    ML->>ML: Model inference
    ML-->>F: {class: "Tomato___Late_blight", confidence: 92.5}
    
    F->>F: Get treatment from PEST_DATABASE
    F->>B: POST /api/pests (report data)
    B->>DB: INSERT INTO pest_reports
    DB-->>B: Success
    B-->>F: {id, message: "Saved"}
    F-->>U: Display analysis results
```

### 3.3 Crop Recommendation Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant DB as PostgreSQL
    
    U->>F: Select soil, water, season
    F->>F: getCropRecommendations()
    F->>F: Calculate scores from CROP_DATABASE
    F->>F: Sort by suitability
    F-->>U: Display recommendations
    
    F->>B: POST /api/recommendations
    Note right of B: user_id is optional (guest support)
    B->>DB: INSERT INTO crop_recommendations
    DB-->>B: {id: "uuid"}
    B-->>F: {message: "Saved successfully"}
    F->>F: Log success (console)
```

---

## 4. Data Flow Diagrams

### 4.1 DFD Level 0 (Context Diagram)

```mermaid
flowchart LR
    Farmer([Farmer])
    Admin([Admin])
    System[("Smart Crop Aid\nSystem")]
    Weather[/"Weather API"/]
    ML[/"ML Model"/]
    
    Farmer -->|"Credentials, Images, Preferences"| System
    System -->|"Reports, Recommendations, Prices"| Farmer
    
    Admin -->|"Credentials, Price Data"| System
    System -->|"Statistics, Reports, User Data"| Admin
    
    Weather -->|"Weather Data"| System
    ML -->|"Disease Classification"| System
    System -->|"Image Data"| ML
```

### 4.2 DFD Level 1

```mermaid
flowchart TB
    subgraph External
        Farmer([Farmer])
        Admin([Admin])
        WeatherAPI[/"OpenWeatherMap"/]
        MLAPI[/"TensorFlow Model"/]
    end
    
    subgraph "Smart Crop Aid System"
        P1["1.0\nAuthentication\nProcess"]
        P2["2.0\nPest Detection\nProcess"]
        P3["3.0\nCrop Recommendation\nProcess"]
        P4["4.0\nMarket Price\nProcess"]
        P5["5.0\nAdmin\nProcess"]
        
        D1[("D1: Users")]
        D2[("D2: Pest Reports")]
        D3[("D3: Recommendations")]
        D4[("D4: Market Prices")]
    end
    
    Farmer -->|"Login/Register"| P1
    P1 -->|"JWT Token"| Farmer
    P1 <-->|"User Data"| D1
    
    Farmer -->|"Crop Image"| P2
    P2 <-->|"Image Analysis"| MLAPI
    P2 -->|"Detection Result"| Farmer
    P2 -->|"Store Report"| D2
    
    Farmer -->|"Conditions"| P3
    P3 -->|"Recommendations"| Farmer
    P3 -->|"Store"| D3
    
    Farmer -->|"Query"| P4
    P4 <-->|"Price Data"| D4
    P4 -->|"Price List"| Farmer
    
    Admin -->|"Admin Actions"| P5
    P5 <-->|"All Data"| D1
    P5 <-->|"All Data"| D2
    P5 <-->|"All Data"| D3
    P5 <-->|"All Data"| D4
    P5 -->|"Stats/Reports"| Admin
```

---

## 5. Class Diagram

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String passwordHash
        +String name
        +String phone
        +UserRole role
        +Boolean isBanned
        +String location
        +Decimal farmSize
        +Decimal farmLat
        +Decimal farmLng
        +String profileImageUrl
        +DateTime createdAt
        +DateTime updatedAt
        +login(email, password) Token
        +register(userData) User
        +updateProfile(data) User
    }
    
    class Crop {
        +String id
        +String userId
        +String cropName
        +String variety
        +Date plantingDate
        +Date expectedHarvestDate
        +CropStatus status
        +Decimal area
        +String soilType
        +create(cropData) Crop
        +update(data) Crop
        +delete() Boolean
    }
    
    class PestReport {
        +String id
        +String userId
        +String cropId
        +String imageUrl
        +String pestName
        +Decimal confidence
        +Severity severity
        +String description
        +String aiAnalysis
        +String treatmentRecommended
        +create(reportData) PestReport
        +getByUser(userId) PestReport[]
    }
    
    class CropRecommendation {
        +String id
        +String userId
        +String soilType
        +String waterLevel
        +String season
        +String recommendationsJson
        +DateTime createdAt
        +save(data) CropRecommendation
        +getHistory(userId) CropRecommendation[]
    }
    
    class MarketPrice {
        +String id
        +String cropName
        +String variety
        +Decimal price
        +String unit
        +String marketName
        +String location
        +Date date
        +Trend trend
        +getAll() MarketPrice[]
        +create(data) MarketPrice
    }
    
    class Notification {
        +String id
        +String userId
        +String title
        +String message
        +NotificationType type
        +Boolean isRead
        +send(userId, data) Notification
        +markRead(id) Boolean
    }
    
    class PestDetectionService {
        +analyzeImage(imageUri, cropType) PestDetection
        +getPestInfo(pestName) PestInfo
        +getCommonPests(cropType) PestInfo[]
    }
    
    class CropRecommendationService {
        +getRecommendations(request) EnhancedCropRecommendation[]
        +calculateScore(crop, conditions) Score
    }
    
    class AuthService {
        +login(email, password) AuthResponse
        +register(userData) AuthResponse
        +verifyToken(token) User
    }
    
    class MLAPIClient {
        +predictPestDisease(imageUri) PredictionResult
        +isModelReady() Boolean
        +getClasses() String[]
    }
    
    User "1" --> "*" Crop : owns
    User "1" --> "*" PestReport : creates
    User "1" --> "*" CropRecommendation : saves
    User "1" --> "*" Notification : receives
    Crop "1" --> "*" PestReport : has
    
    PestDetectionService --> MLAPIClient : uses
    PestDetectionService --> PestReport : creates
    CropRecommendationService --> CropRecommendation : creates
    AuthService --> User : manages
```

---

## 6. Activity Diagrams

### 6.1 Pest Detection Activity

```mermaid
flowchart TD
    Start([Start])
    SelectImage{{"Select Image Source"}}
    Camera["Open Camera"]
    Gallery["Open Gallery"]
    CapturePhoto["Capture Photo"]
    SelectPhoto["Select Photo"]
    ValidateImage{{"Is Valid Leaf?"}}
    No1["Show Error: Not a Leaf"]
    UploadImage["Upload Image to Server"]
    UploadSuccess{{"Upload OK?"}}
    LocalOnly["Mark for Local Storage Only"]
    SendToML["Send to ML API"]
    MLAvailable{{"ML API Available?"}}
    SimulateDetection["Use Simulation Mode"]
    GetPrediction["Get ML Prediction"]
    EnrichResult["Add Treatment/Prevention Info"]
    SaveToDB["Save Report to Database"]
    SaveSuccess{{"Save OK?"}}
    SaveLocal["Save to Local Storage"]
    DisplayResult["Display Results to User"]
    End([End])
    
    Start --> SelectImage
    SelectImage -->|Camera| Camera
    SelectImage -->|Gallery| Gallery
    Camera --> CapturePhoto
    Gallery --> SelectPhoto
    CapturePhoto --> ValidateImage
    SelectPhoto --> ValidateImage
    ValidateImage -->|No| No1
    No1 --> SelectImage
    ValidateImage -->|Yes| UploadImage
    UploadImage --> UploadSuccess
    UploadSuccess -->|No| LocalOnly
    UploadSuccess -->|Yes| SendToML
    LocalOnly --> SendToML
    SendToML --> MLAvailable
    MLAvailable -->|No| SimulateDetection
    MLAvailable -->|Yes| GetPrediction
    SimulateDetection --> EnrichResult
    GetPrediction --> EnrichResult
    EnrichResult --> SaveToDB
    SaveToDB --> SaveSuccess
    SaveSuccess -->|No| SaveLocal
    SaveSuccess -->|Yes| DisplayResult
    SaveLocal --> DisplayResult
    DisplayResult --> End
```

### 6.2 User Registration Activity

```mermaid
flowchart TD
    Start([Start])
    EnterDetails["Enter Registration Details"]
    ValidateInput{{"Input Valid?"}}
    ShowErrors["Show Validation Errors"]
    SubmitToAPI["Submit to Backend API"]
    CheckDuplicate{{"Email Exists?"}}
    ShowDupError["Show: Email Already Registered"]
    HashPassword["Hash Password (bcrypt)"]
    CreateUser["Create User in Database"]
    GenerateToken["Generate JWT Token"]
    SaveToken["Save Token to AsyncStorage"]
    NavigateHome["Navigate to Home Screen"]
    End([End])
    
    Start --> EnterDetails
    EnterDetails --> ValidateInput
    ValidateInput -->|Invalid| ShowErrors
    ShowErrors --> EnterDetails
    ValidateInput -->|Valid| SubmitToAPI
    SubmitToAPI --> CheckDuplicate
    CheckDuplicate -->|Yes| ShowDupError
    ShowDupError --> EnterDetails
    CheckDuplicate -->|No| HashPassword
    HashPassword --> CreateUser
    CreateUser --> GenerateToken
    GenerateToken --> SaveToken
    SaveToken --> NavigateHome
    NavigateHome --> End
```

---

## 7. Diagram Legend

| Symbol | Meaning |
|--------|---------|
| `([...])` | Start/End (Terminal) |
| `[...]` | Process/Action |
| `{...}` | Decision |
| `((...))` | External Entity |
| `[/".../"/]` | External System |
| `[("...")]` | Data Store |
| `-->` | Data Flow / Control Flow |
| `<-->` | Bidirectional Flow |
| `-.->` | Dependency |

---

<p align="center">
Created for Smart Crop Aid v1.0.0 | December 2024
</p>

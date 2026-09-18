# 💳 Stripe Payment Gateway Integration (E-Commerce Ready)

A modern, high-performance **Spring Boot** application for processing online payments via **Stripe Checkout** (supporting **Visa**, **Mastercard**, **American Express**, **Apple Pay**, and **Google Pay**), built with a clean, extensible architecture ready to be integrated into any e-commerce platform.

---

## 🌟 Key Features

- **Port 3000 Ready:** Pre-configured to run directly on port `3000`.
- **Database Persistence:** Real-time transaction and order logging powered by **PostgreSQL 18** (`stripepayment_ec`).
- **Cambodia Card Support:** Fully compatible with Visa / Mastercard debit and credit cards issued by Cambodian banks (such as ABA Bank, ACLEDA Bank, Canadia, Chip Mong, Wing).
- **Stripe Checkout Sessions:** Safe, PCI-compliant hosted checkout sessions with automated currency handling and 3D Secure verification.
- **Webhook Processing:** Secure webhook endpoint to asynchronously capture and confirm payment completion.
- **Modern Responsive Portal:** Sleek, glassmorphism UI with preset amounts ($5, $15, $30, $50, custom input), live fee calculation, animated receipts, and friendly retry pages.
- **E-Commerce Extensible:** Decoupled service architecture prepared to support shopping cart orders and alternative local payment gateways (such as ABA PayWay KHQR).

---

## 🔬 Research Deep Dive: Stripe & KHQR in Cambodia

### 1. Can Stripe Connect to KHQR?

> **No.** Stripe **cannot** connect to KHQR, and KHQR cannot be processed through Stripe.

- **Reasoning:** KHQR is Cambodia's national QR payment standard operated by the **National Bank of Cambodia (NBC)** across the **Bakong** interbank system. Stripe does not support the Bakong network, nor does it support domestic merchant settlements into Cambodian bank accounts.
- **To Accept KHQR in Cambodia:** You must integrate local Cambodian payment gateway APIs such as:
  - **ABA PayWay API** (most common for Cambodian e-commerce; generates dynamic KHQR with push callbacks).
  - **Bakong Open API / KHQR SDK** (official from NBC).
  - **Wing Commerce / ACLEDA E-Commerce API**.

### 2. Can Cambodian Customers Pay with Visa / Mastercard on Stripe?

> **Yes, absolutely.**

- **How it works:** Any customer in Cambodia holding a **Visa** or **Mastercard** (debit or credit) issued by local banks (e.g. **ABA Bank**, **ACLEDA**, **Canadia**, **Chip Mong**, **Wing**) can complete payments on Stripe.
- **Requirements:** E-commerce / International payments must be toggled on in the user's mobile banking app (ABA virtual and plastic Visa cards have this active by default).
- **Currency:** Transactions are processed in **USD**, aligning directly with Cambodian bank USD accounts and avoiding unnecessary currency conversion fees.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Frontend Web Client (Port 3000)          │
│        (index.html / success.html / cancel.html)       │
└──────────────────────────┬─────────────────────────────┘
                           │  HTTP REST (JSON)
                           ▼
┌────────────────────────────────────────────────────────┐
│            Spring Boot 3.x Application Layer           │
│ ────────────────────────────────────────────────────── │
│  • PaymentApiController (/api/v1/payments/*)           │
│  • PaymentOrderService (Order state machine)           │
│  • StripeService (Stripe Checkout Session & Webhook)   │
└──────────────┬───────────────────────────┬─────────────┘
               │ JPA / Hibernate           │ Stripe Java SDK
               ▼                           ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│        PostgreSQL 18         │ │     Stripe Cloud      │
│     (stripepayment_ec)       │ │   (Checkout & Card)   │
└──────────────────────────────┘ └───────────────────────┘
```

---

## 👥 Team Work Division (3-Person Structure)

For complete task breakdown and sprint milestones, see [PROJECT_PLAN.md](PROJECT_PLAN.md).

| Role         | Name / Assignee              | Core Focus                 | Key Deliverables                                                                                    |
| :----------- | :--------------------------- | :------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Person 1** | Backend & Gateway Specialist | PostgreSQL & Stripe SDK    | `PaymentOrder` entity, `stripepayment_ec` DB config, `StripeService.java`, Webhook handling         |
| **Person 2** | API & E-Commerce Architect   | Business Logic & REST APIs | DTO validation, `PaymentOrderService.java`, `PaymentApiController.java`, order status state machine |
| **Person 3** | Frontend & UX Developer      | UI/UX & Client Integration | `index.html`, `success.html`, `cancel.html`, `style.css`, `app.js`, checkout redirection            |

---

## 📂 Project Folder Structure

```text
StripePayment_EC_FinalY4sm1/
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/com/ecommerce/payment/
│   │   │   ├── config/
│   │   │   │   ├── StripeConfig.java          # Initializes Stripe API key
│   │   │   │   └── WebConfig.java             # CORS & MVC resource routing
│   │   │   ├── controller/
│   │   │   │   └── PaymentApiController.java  # REST API endpoints & webhooks
│   │   │   ├── dto/
│   │   │   │   ├── OrderReceiptDto.java       # Receipt summary model
│   │   │   │   ├── PaymentRequestDto.java     # Input validation schema
│   │   │   │   └── PaymentResponseDto.java    # Checkout URL & session info
│   │   │   ├── model/entity/
│   │   │   │   ├── PaymentOrder.java          # JPA entity for database
│   │   │   │   └── PaymentStatus.java         # PENDING, COMPLETED, FAILED, CANCELLED
│   │   │   ├── repository/
│   │   │   │   └── PaymentOrderRepository.java# Spring Data JPA repository
│   │   │   ├── service/
│   │   │   │   ├── PaymentOrderService.java   # Order creation & state lifecycle
│   │   │   │   └── StripeService.java         # Stripe Session & Webhook SDK logic
│   │   │   └── StripePaymentEcApplication.java
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/
│   │       │   │   └── style.css              # Glassmorphism dark-mode styles
│   │       │   ├── js/
│   │       │   │   └── app.js                 # Form handling & Stripe redirect
│   │       │   ├── cancel.html                # Payment cancelled page
│   │       │   ├── index.html                 # Main payment portal
│   │       │   └── success.html               # Payment confirmation receipt
│   │       ├── templates/
│   │       │   └── .gitkeep
│   │       └── application.properties.example # Safe configuration template (tracked in Git)
│   └── test/
│       └── java/com/ecommerce/payment/
│           └── StripePaymentEcApplicationTests.java
├── mvnw
├── mvnw.cmd
├── pom.xml
├── README.md                                  # Main project documentation
└── PROJECT_PLAN.md                            # 3-Person Team Breakdown & Milestones
```

---

## 🛠️ Tech Stack

- **Backend:** Java 21, Spring Boot 3.x, Spring Data JPA, Hibernate, Lombok
- **Payment SDK:** Official `com.stripe:stripe-java:28.4.0`
- **Database:** PostgreSQL 18 (`stripepayment_ec`)
- **Frontend:** HTML5, CSS3 (Vanilla Glassmorphism), Modern JavaScript (ES6+)
- **Build Tool:** Maven Wrapper (`./mvnw` or `mvnw.cmd`)

---

## ⚙️ Configuration Setup

To keep database credentials and Stripe secret keys secure, the real `application.properties` is ignored by Git.

1. Copy the example file:

   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application.properties
   ```

2. Update your local credentials inside `src/main/resources/application.properties`:

   ```properties
   # Server
   server.port=3000

   # PostgreSQL Database
   spring.datasource.url=jdbc:postgresql://localhost:5432/stripepayment_ec
   spring.datasource.username=postgres
   spring.datasource.password=your_password_here
   spring.datasource.driver-class-name=org.postgresql.Driver

   # Stripe Configuration (Test Mode)
   stripe.api.key=sk_test_your_secret_key_here
   stripe.publishable.key=pk_test_your_publishable_key_here
   stripe.currency=usd
   app.base-url=http://localhost:3000
   ```

---

## 🚀 How to Run Locally

### 1. Prerequisites

- **Java 21** installed (`java -version`).
- **PostgreSQL 18** running on port `5432` with database `stripepayment_ec`.
- A Stripe account with test keys (`pk_test_...`, `sk_test_...`) from [dashboard.stripe.com](https://dashboard.stripe.com/test/apikeys).

### 2. Set Your Stripe Test Keys

In PowerShell:

```powershell
$env:STRIPE_SECRET_KEY="sk_test_your_actual_test_secret_key"
$env:STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_publishable_key"
```

### 3. Start the Application

Run using the Maven wrapper:

```powershell
# Windows PowerShell
.\mvnw.cmd spring-boot:run
```

The application will start on: **`http://localhost:3000`**

### 4. Test the Payment Flow

1. Open `http://localhost:3000` in your browser.
2. Select or enter an amount (e.g. `$15.00`), enter your name and email.
3. Click **Pay with Stripe**.
4. You will be redirected to the secure Stripe Checkout page.
5. In test mode, enter Stripe's test card:
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g. `12/28`)
   - **CVC:** Any 3 digits (e.g. `123`)
6. Click **Pay**. You will be redirected to `success.html` displaying your official receipt!

---

## 📡 REST API Documentation

### 1. Create Checkout Session

- **Endpoint:** `POST /api/v1/payments/create-checkout-session`
- **Request Body:**

```json
{
  "amount": 15.0,
  "currency": "USD",
  "customerName": "Sopheak Chan",
  "customerEmail": "sopheak@example.com",
  "description": "E-Book: Spring Boot & Cloud Architecture"
}
```

- **Response:**

```json
{
  "orderReference": "ORD-20260918-A79B1C",
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_...",
  "status": "PENDING",
  "message": "Stripe Checkout Session initialized successfully"
}
```

### 2. Confirm Payment & Get Receipt

- **Endpoint:** `GET /api/v1/payments/confirm/{sessionId}`
- **Response:**

```json
{
  "orderReference": "ORD-20260918-A79B1C",
  "amount": 15.0,
  "currency": "USD",
  "status": "COMPLETED",
  "customerName": "Sopheak Chan",
  "customerEmail": "sopheak@example.com",
  "description": "E-Book: Spring Boot & Cloud Architecture",
  "stripeSessionId": "cs_test_...",
  "stripePaymentIntentId": "pi_...",
  "createdAt": "2026-09-18T13:55:00"
}
```

### 3. Stripe Webhook

- **Endpoint:** `POST /api/v1/payments/stripe/webhook`
- **Headers:** `Stripe-Signature: <signature>`
- **Description:** Verifies Stripe signature and updates order status to `COMPLETED` asynchronously.

---

## 📜 License

This project is open-source and ready for educational and commercial integration.
"# StriptPayment_EC"

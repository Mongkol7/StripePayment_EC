/**
 * StripePay EC - Storefront & Payment Logic (Apple iOS 27 Design System)
 * Person 3: Frontend & User Experience (UX/UI) Developer
 */

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // 1. CONSTANTS & PRODUCTS CATALOG (Task 3.1 & VIP Track)
    // ========================================================
    const KHR_RATE = 4100; // 1 USD = 4,100 KHR
    let currentCurrency = localStorage.getItem('selected_currency') || 'USD';
    let currentCategory = 'ALL';
    let currentStoreView = 'buy'; // 'buy' or 'pass'

    const PRODUCTS = [
        {
            id: 'book-1',
            title: 'Cloud-Native Spring Boot 3 Microservices',
            category: 'BACKEND',
            categoryName: 'Spring Boot 3 & Cloud Architecture',
            author: 'Design, Build & Deploy Resilient Distributed Systems on Kubernetes',
            priceUsd: 29.00,
            studyDays: 10,
            totalVipCost: 9.90,
            savingsPercent: 66,
            rating: '5.0 (128 reviews)',
            badge: 'bestseller',
            badgeText: 'BESTSELLER',
            icon: '☕',
            coverImage: '/images/covers/cloud-native-spring-boot.jpg',
            description: 'Comprehensive guide covering Spring Cloud, Docker, Kubernetes, Stripe payments, and reactive microservices.',
            highlights: [
                'Java 21 & Spring Boot 3 Core Production Setup',
                'Spring Cloud Discovery, Config Server & Gateway',
                'Docker Multi-Stage & Kubernetes Deployments',
                'Apache Kafka High-Throughput Event Streams',
                'Observability: Grafana, Tempo & Distributed Tracing',
                'Distributed Transactions, Saga & Outbox Patterns'
            ],
            modules: [
                {
                    number: '01',
                    title: 'Cloud-Native Core & Java 21 Baseline',
                    topics: ['Java 21 runtime & Virtual Threads baseline', 'Spring Boot 3 configuration & dependency injection', 'Cloud configuration server & externalized properties'],
                    codeSnippet: `// Java 21 + Spring Boot 3 Virtual Threads Controller
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderProcessingService orderProcessingService;

    public OrderController(OrderProcessingService orderProcessingService) {
        this.orderProcessingService = orderProcessingService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> processOrder(@Valid @RequestBody OrderRequest req) {
        // Leverages Java 21 Project Loom Virtual Threads for zero-overhead async I/O
        OrderResponse response = orderProcessingService.executeOrderSaga(req);
        return ResponseEntity.ok(response);
    }
}`
                },
                {
                    number: '02',
                    title: 'Microservices & Gateway Dynamic Routing',
                    topics: ['Order, Payment, Inventory, User & Notification services', 'Spring Cloud Gateway dynamic routing & rate limiting', 'Service discovery & health check registries'],
                    codeSnippet: `# application.yml - Spring Cloud Gateway Resilience & Rate Limiter
spring:
  cloud:
    gateway:
      routes:
        - id: payment-service-route
          uri: lb://PAYMENT-SERVICE
          predicates:
            - Path=/api/v1/payments/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 50
                redis-rate-limiter.burstCapacity: 100
            - name: CircuitBreaker
              args:
                name: paymentCircuitBreaker
                fallbackUri: forward:/fallback/payments`
                },
                {
                    number: '03',
                    title: 'Event-Driven Messaging with Apache Kafka',
                    topics: ['High-throughput event streaming & message schemas', 'Asynchronous pub/sub choreography between microservices', 'Consumer groups, partition balancing & replay mechanisms'],
                    codeSnippet: `@Component
public class PaymentEventProducer {
    private final KafkaTemplate<String, PaymentEvent> kafkaTemplate;

    public PaymentEventProducer(KafkaTemplate<String, PaymentEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishPaymentCompleted(String orderRef, BigDecimal amount) {
        PaymentEvent event = new PaymentEvent(orderRef, amount, Instant.now(), "PAID");
        kafkaTemplate.send("orders.payment.completed", orderRef, event);
    }
}`
                },
                {
                    number: '04',
                    title: 'Distributed Transactions & Saga Orchestration',
                    topics: ['Saga orchestration pattern for cross-service checkout', 'Transactional Outbox pattern for guaranteed delivery', 'Resilience4j circuit breakers, retries & fallbacks'],
                    codeSnippet: `@Service
public class OrderSagaCoordinator {
    @Transactional
    public void executeCheckout(OrderContext ctx) {
        try {
            inventoryClient.reserveStock(ctx.getItems());
            paymentClient.chargeCustomer(ctx.getPaymentInfo());
            notificationClient.sendReceipt(ctx.getEmail());
        } catch (PaymentException ex) {
            // Compensating transaction
            inventoryClient.releaseStock(ctx.getItems());
            throw new OrderProcessingException("Payment failed, stock rollback completed.", ex);
        }
    }
}`
                },
                {
                    number: '05',
                    title: 'Observability & Kubernetes Deployment',
                    topics: ['Distributed tracing with OpenTelemetry, Tempo & Grafana', 'Multi-stage Docker builds & Kubernetes manifests', 'Zero-downtime rolling deploys & production liveness probes'],
                    codeSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: springboot-payment-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: payment-api
        image: stripepay-ec/payment-api:latest
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 15`
                }
            ],
            specs: {
                pages: '520 Pages',
                format: 'PDF + ePub + Source Repos',
                edition: '2026 Enterprise Edition',
                level: 'Intermediate to Advanced'
            }
        },
        {
            id: 'book-2',
            title: 'System Design Interview Blueprint',
            category: 'ARCHITECTURE',
            categoryName: 'Enterprise Scale Architectures',
            author: 'Mastering Modern High-Availability Architectures',
            priceUsd: 25.00,
            studyDays: 8,
            totalVipCost: 7.92,
            savingsPercent: 68,
            rating: '4.9 (94 reviews)',
            badge: 'hot',
            badgeText: 'HOT',
            icon: '🏛️',
            coverImage: '/images/covers/system-design-blueprint.png',
            description: 'Learn high-availability patterns, distributed caching, rate limiters, payment webhooks, and event-driven architectures.',
            highlights: [
                'Global DNS, CDN & Multi-Tier Load Balancer Design',
                'Redis Distributed Caching & Invalidation Patterns',
                'Rate Limiting with Leaky Bucket & Token Bucket',
                'Dual Payment Gateways (Stripe, VISA, PayPal)',
                'Idempotent Webhook Processing & Async Retries',
                'Kafka & RabbitMQ Event Streaming at Scale'
            ],
            modules: [
                {
                    number: '01',
                    title: 'High Availability Patterns & Global Edge',
                    topics: ['Global DNS routing & CDN edge static content caching', 'Multi-tier load balancers with active health checks', 'Horizontal web server scaling & stateless sessions'],
                    codeSnippet: `# Global Nginx Reverse Proxy & SSL Termination
upstream backend_cluster {
    least_conn;
    server 10.0.1.10:8080 max_fails=3 fail_timeout=10s;
    server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;
    server 10.0.1.12:8080 max_fails=3 fail_timeout=10s;
    keepalive 64;
}`
                },
                {
                    number: '02',
                    title: 'Distributed Caching & Stampede Protection',
                    topics: ['Redis distributed cache-aside & write-through strategies', 'Cache invalidation, TTL management & stampede protection', 'High-speed session storage & in-memory counters'],
                    codeSnippet: `// Redis Cache-Aside with Distributed Mutex (Stampede Lock)
async function getProductWithLock(productId) {
    const cached = await redis.get(\`product:\${productId}\`);
    if (cached) return JSON.parse(cached);

    // Acquire 2-second Redis distributed lock
    const acquired = await redis.set(\`lock:product:\${productId}\`, 'locked', 'NX', 'PX', 2000);
    if (acquired) {
        const dbResult = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        await redis.set(\`product:\${productId}\`, JSON.stringify(dbResult), 'EX', 3600);
        await redis.del(\`lock:product:\${productId}\`);
        return dbResult;
    }
    // Wait briefly and retry cached read
    await new Promise(r => setTimeout(r, 100));
    return getProductWithLock(productId);
}`
                },
                {
                    number: '03',
                    title: 'Rate Limiters & API Gateway Algorithms',
                    topics: ['Token Bucket, Leaky Bucket & Sliding Window algorithms', 'Distributed rate limiting with Redis atomic operations', 'DDoS defense & client IP throttling'],
                    codeSnippet: `-- Redis Lua Script: Sliding Window Log Rate Limiter
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

local clearBefore = now - window
redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
local currentRequests = redis.call('ZCARD', key)

if currentRequests < limit then
    redis.call('ZADD', key, now, now)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1 -- Allowed
else
    return 0 -- Rejected
end`
                },
                {
                    number: '04',
                    title: 'Payment Gateways & Idempotent Webhooks',
                    topics: ['Dual payment routing (Stripe Visa/Mastercard & Bakong KHQR)', 'Asynchronous payment webhooks with cryptographic verification', 'Idempotency keys & exponential backoff retries'],
                    codeSnippet: `@PostMapping("/webhook")
public ResponseEntity<String> handleStripeWebhook(@RequestHeader("Stripe-Signature") String sigHeader, @RequestBody String payload) {
    Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
    
    // Enforce cryptographic idempotency
    if (orderRepository.existsByEventId(event.getId())) {
        return ResponseEntity.ok("Already processed");
    }
    
    orderService.fulfillOrder(event);
    return ResponseEntity.ok("Received");
}`
                }
            ],
            specs: {
                pages: '480 Pages',
                format: 'PDF + ePub + Architecture Blueprints',
                edition: '2026 Interview Edition',
                level: 'All Engineering Levels'
            }
        },
        {
            id: 'book-3',
            title: 'High-Performance Java & Concurrency Mastery',
            category: 'BACKEND',
            categoryName: 'JVM Internal Engineering',
            author: 'Low-Latency & Virtual Thread Engineering in Java 21+',
            priceUsd: 19.50,
            studyDays: 7,
            totalVipCost: 6.93,
            savingsPercent: 64,
            rating: '4.8 (76 reviews)',
            badge: 'new',
            badgeText: 'NEW',
            icon: '⚡',
            coverImage: '/images/covers/java-concurrency.jpg',
            description: 'Unlock virtual threads, lock-free data structures, memory profiling, and low-latency financial systems in Java 21+.',
            highlights: [
                'Virtual Thread Basics, Thread Pinning & Tuning',
                'Structured Concurrency & Scoped Values in Java 21+',
                'Atomic & CAS Lock-Free Data Structures',
                'Memory Profiling with VisualVM & Java Flight Recorder',
                'Garbage Collector Tuning: ZGC, Shenandoah & G1',
                'Low-Latency LMAX Disruptor Financial Pattern'
            ],
            modules: [
                {
                    number: '01',
                    title: 'Virtual Threads (Project Loom) & Scoped Values',
                    topics: ['Virtual thread basics & lightweight M:N scheduling', 'Thread pinning detection & carrier thread tuning', 'Structured concurrency & Scoped Values in Java 21+'],
                    codeSnippet: `// Structured Concurrency in Java 21
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Supplier<CustomerProfile> userTask = scope.fork(() -> fetchUser(userId));
    Supplier<List<Order>> ordersTask = scope.fork(() -> fetchOrders(userId));

    scope.join();           // Wait for both concurrent tasks
    scope.throwIfFailed();  // Propagate first failure

    return new DashboardDto(userTask.get(), ordersTask.get());
}`
                },
                {
                    number: '02',
                    title: 'Lock-Free Data Structures & CAS Operations',
                    topics: ['Atomic variables, Memory Barriers & Compare-And-Swap (CAS)', 'Concurrent collections internals & cache contention', 'Lock-free single-producer single-consumer queues & stacks'],
                    codeSnippet: `public class LockFreeStack<T> {
    private final AtomicReference<Node<T>> head = new AtomicReference<>(null);

    public void push(T item) {
        Node<T> newHead = new Node<>(item);
        Node<T> oldHead;
        do {
            oldHead = head.get();
            newHead.next = oldHead;
        } while (!head.compareAndSet(oldHead, newHead)); // CAS loop
    }
}`
                }
            ],
            specs: {
                pages: '440 Pages',
                format: 'PDF + ePub + Benchmark Suites',
                edition: '2026 Java 21+ Edition',
                level: 'Advanced Engineers'
            }
        },
        {
            id: 'book-4',
            title: 'Kubernetes & Docker Production Guide',
            category: 'CLOUD',
            categoryName: 'DevOps & GitOps In Practice',
            author: 'Multi-Cluster Orchestration & Production Pipelines',
            priceUsd: 14.50,
            studyDays: 5,
            totalVipCost: 4.95,
            savingsPercent: 66,
            rating: '4.9 (83 reviews)',
            badge: 'hot',
            badgeText: 'HOT',
            icon: '🐳',
            coverImage: '/images/covers/kubernetes-docker.jpg',
            description: 'From local containerization to multi-cluster orchestration, Helm charts, CI/CD pipelines, and zero-downtime rolling deploys.',
            highlights: [
                'Production Containerization & Distroless Hardening',
                'Helm Chart Templating & Dependency Management',
                'Automated CI/CD Pipelines & Image Security Scans',
                'Zero-Downtime Rolling & Blue-Green Deployments',
                'GitOps Continuous Delivery with ArgoCD',
                'Multi-Cluster High Availability & Ingress Rules'
            ],
            modules: [
                {
                    number: '01',
                    title: 'Multi-Stage Docker Builds & Distroless Base',
                    topics: ['Multi-stage Docker builds for minimal image size', 'Distroless & Alpine base image security hardening', 'Non-root execution & Linux kernel capability stripping'],
                    codeSnippet: `# Multi-stage secure build
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM gcr.io/distroless/java21-debian12:nonroot
WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`
                }
            ],
            specs: {
                pages: '410 Pages',
                format: 'PDF + ePub + Helm & K8s Manifests',
                edition: '2026 Cloud-Native Edition',
                level: 'Intermediate to Advanced'
            }
        },
        {
            id: 'book-5',
            title: 'PostgreSQL & Database Tuning Handbook',
            category: 'BACKEND',
            categoryName: 'High Volume Data Engineering',
            author: 'Mastering ACID, Partitioning & Query Execution Plans',
            priceUsd: 11.00,
            studyDays: 4,
            totalVipCost: 3.96,
            savingsPercent: 64,
            rating: '4.7 (65 reviews)',
            badge: 'new',
            badgeText: 'NEW',
            icon: '🐘',
            coverImage: '/images/covers/postgresql-tuning.jpg',
            description: 'Master indexing strategies, ACID transaction isolation, foreign keys, partition tables, and query execution plans.',
            highlights: [
                'Indexing Deep Dive: B-Tree, Hash, GIN, GiST, BRIN',
                'ACID Isolation: Read Committed to Serializable',
                'Referential Integrity & Cascading Foreign Keys',
                'High Volume Table Partitioning (Range, List, Hash)',
                'Query Execution Plans & EXPLAIN ANALYZE Optimization',
                'Parallel Seq Scans & WAL Checkpoint Tuning'
            ],
            modules: [
                {
                    number: '01',
                    title: 'Declarative Partitioning & Index Tuning',
                    topics: ['Declarative Range & List table partitioning', 'Partition pruning & EXPLAIN ANALYZE speedups', 'Zero-downtime REINDEX CONCURRENTLY'],
                    codeSnippet: `-- Range Partitioning on Orders Table by Created Date
CREATE TABLE orders (
    id UUID NOT NULL,
    order_reference VARCHAR(64) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2026_q1 PARTITION OF orders
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-04-01 00:00:00+00');`
                }
            ],
            specs: {
                pages: '390 Pages',
                format: 'PDF + ePub + SQL Migration Scripts',
                edition: '2026 Database Edition',
                level: 'Backend Engineers & DBAs'
            }
        },
        {
            id: 'book-6',
            title: 'Full-Stack Modern Web & Payment Architecture',
            category: 'ARCHITECTURE',
            categoryName: 'E-Commerce Engineering Series',
            author: 'Resilient Next.js, Stripe, KHQR & Order Ledgers',
            priceUsd: 22.00,
            studyDays: 8,
            totalVipCost: 7.92,
            savingsPercent: 64,
            rating: '4.9 (112 reviews)',
            badge: 'bestseller',
            badgeText: 'POPULAR',
            icon: '🌐',
            coverImage: '/images/covers/fullstack-payment.jpg',
            description: 'Build end-to-end resilient e-commerce stores with dual Stripe and KHQR gateways, Webhooks, and order ledgers.',
            highlights: [
                'Dual Gateways: Stripe (Cards/Wallets) & KHQR Bakong',
                'Real-Time Asynchronous & Idempotent Webhook Processing',
                'Immutable Financial Order Ledgers & Tax Invoices',
                'Next.js 15, NestJS & PostgreSQL Micro-Architecture',
                'Redis Cache Layering & Circuit Breaker Fault Tolerance',
                'Production CI/CD, Automated Deploys & Observability'
            ],
            modules: [
                {
                    number: '01',
                    title: 'Dual Payment Gateway Integration (Stripe & KHQR)',
                    topics: ['Stripe payment gateway for Visa, Mastercard, Apple & Google Pay', 'Cambodian KHQR Bakong integration with live currency conversion', 'Multi-currency settlement between USD and KHR'],
                    codeSnippet: `// Server-Side Stripe Checkout Session Creation
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
        price_data: {
            currency: 'usd',
            product_data: { name: 'VIP Engineering Daily Pass' },
            unit_amount: 99, // $0.99
            recurring: { interval: 'day' }
        },
        quantity: 1
    }],
    mode: 'subscription',
    success_url: \`\${BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${BASE_URL}/?canceled=true\`
});`
                }
            ],
            specs: {
                pages: '460 Pages',
                format: 'PDF + ePub + Full-Stack Starter Kit',
                edition: '2026 E-Commerce Edition',
                level: 'Full-Stack Developers'
            }
        },
        {
            id: 'plan-daily-vip',
            title: 'VIP Engineering Daily Pass (All-Access)',
            category: 'SUBSCRIPTION',
            categoryName: 'Daily Recurring Membership',
            author: 'Continuous 24-Hour Access to Full Architecture & Code Library',
            priceUsd: 0.99,
            studyDays: 1,
            totalVipCost: 0.99,
            savingsPercent: 99,
            rating: '5.0 (Unlimited)',
            badge: 'bestseller',
            badgeText: 'RECURRING',
            icon: '🔁',
            coverImage: '/images/covers/daily-vip-pass.jpg',
            description: 'Unlimited access to all 6 technical e-books, full-stack source code, and architecture blueprints. Automatically renews daily at $0.99/day. Cancel anytime.',
            highlights: [
                'Instant Access to All 6 Full E-Books and Guides',
                'Full GitHub Source Repositories & Docker Stacks',
                'Continuous 24-Hour Automatic Renewal ($0.99/day)',
                'Instant 1-Click Cancellation Anytime in Orders Portal'
            ],
            modules: [
                {
                    number: 'VIP',
                    title: 'Full Engineering Access Pass',
                    topics: [
                        'All-inclusive reading rights to entire technical catalog',
                        'Automated daily billing ($0.99 USD every 24 hours via Stripe)',
                        'Self-service 1-click cancellation directly from Orders dashboard'
                    ]
                }
            ],
            specs: {
                pages: 'All Books Included',
                format: 'Digital Pass + GitHub Sync',
                edition: 'Continuous Daily Access',
                level: 'All Levels'
            },
            isSubscription: true
        }
    ];

    // ========================================================
    // 2. VIP STATE MANAGEMENT & PERSISTENCE
    // ========================================================
    function getVipSubscriptionState() {
        // Check URL params for explicit activation (e.g. from redirect)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('subscribed') === 'true' || urlParams.get('vip') === 'active') {
            localStorage.setItem('stripe_ec_vip_active', 'true');
        }

        const isExplicitlyFalse = localStorage.getItem('stripe_ec_vip_active') === 'false';
        if (isExplicitlyFalse) {
            return {
                isSubscriber: false,
                orderReference: null,
                expiryStr: ''
            };
        }

        // Check explicit flag in localStorage
        const isVipFlag = localStorage.getItem('stripe_ec_vip_active') === 'true';
        const savedOrders = JSON.parse(localStorage.getItem('stripe_ec_user_orders') || '[]');
        
        // Check if there is an active subscription order
        const subOrder = savedOrders.find(o => 
            (o.paymentType === 'SUBSCRIPTION' || (o.description && (o.description.toLowerCase().includes('vip') || o.description.toLowerCase().includes('daily')))) &&
            o.subscriptionStatus !== 'CANCELLED' &&
            (o.status === 'COMPLETED' || o.status === 'ACTIVE' || !o.status)
        );

        const isSubscriber = isVipFlag || Boolean(subOrder);
        const orderReference = (subOrder ? subOrder.orderReference : null) || localStorage.getItem('stripe_ec_vip_order_ref') || 'ORD-VIP-ACTIVE';
        
        return {
            isSubscriber: isSubscriber,
            orderReference: orderReference,
            expiryStr: '24 hours remaining (Auto-renews daily)'
        };
    }

    function updateVipUI() {
        const vipState = getVipSubscriptionState();
        const profileAvatarIcon = document.getElementById('profileAvatarIcon');
        const profileCrownBadge = document.getElementById('profileCrownBadge');
        const profileStatusText = document.getElementById('profileStatusText');
        const dropdownMembershipTag = document.getElementById('dropdownMembershipTag');
        const dropdownVipExpiryNotice = document.getElementById('dropdownVipExpiryNotice');
        const btnProfileCancelSub = document.getElementById('btnProfileCancelSub');
        const vipActiveDashboardBanner = document.getElementById('vipActiveDashboardBanner');
        const btnVipGetStarted = document.getElementById('btnVipGetStarted');

        if (vipState.isSubscriber) {
            // Add iOS 27 golden glowing halo ring to avatar
            if (profileAvatarIcon) profileAvatarIcon.classList.add('vip-avatar-glow');
            if (profileCrownBadge) profileCrownBadge.style.display = 'block';
            if (profileStatusText) {
                profileStatusText.textContent = 'VIP Member';
                profileStatusText.style.color = '#b26a00';
            }
            if (dropdownMembershipTag) {
                dropdownMembershipTag.className = 'profile-membership-tag vip';
                dropdownMembershipTag.innerHTML = '<span>👑</span> VIP All-Access Subscriber';
            }
            if (dropdownVipExpiryNotice) {
                dropdownVipExpiryNotice.style.display = 'block';
                const expirySpan = document.getElementById('dropdownExpiryTime');
                if (expirySpan) expirySpan.textContent = '24-hour cycle (Active)';
            }
            if (btnProfileCancelSub) {
                btnProfileCancelSub.style.display = 'block';
            }
            if (vipActiveDashboardBanner) {
                vipActiveDashboardBanner.style.display = 'flex';
            }
            // Update Store Switcher VIP Tab
            const tabPassBtn = document.getElementById('tabViewPass');
            if (tabPassBtn) {
                tabPassBtn.innerHTML = `<span>👑</span> VIP All-Access Pass <span class="view-btn-badge" style="background: rgba(52, 199, 89, 0.2); color: #248a3d; border: 1px solid rgba(52, 199, 89, 0.4); font-weight: 700;">✓ Subscribed</span>`;
            }
            // Transform VIP Pass view CTA to indicate active subscription (Darker color, 'Subscribed' label)
            if (btnVipGetStarted) {
                btnVipGetStarted.classList.add('btn-subscribed-dark');
                btnVipGetStarted.innerHTML = `<span class="subscribed-check">✓</span> <span>Subscribed</span>`;
            }
        } else {
            // Remove halo
            if (profileAvatarIcon) profileAvatarIcon.classList.remove('vip-avatar-glow');
            if (profileCrownBadge) profileCrownBadge.style.display = 'none';
            if (profileStatusText) {
                profileStatusText.textContent = 'Account';
                profileStatusText.style.color = 'var(--apple-text-primary)';
            }
            if (dropdownMembershipTag) {
                dropdownMembershipTag.className = 'profile-membership-tag free';
                dropdownMembershipTag.innerHTML = '<span>🏷️</span> Standard Member';
            }
            if (dropdownVipExpiryNotice) {
                dropdownVipExpiryNotice.style.display = 'none';
            }
            if (btnProfileCancelSub) {
                btnProfileCancelSub.style.display = 'none';
            }
            if (vipActiveDashboardBanner) {
                vipActiveDashboardBanner.style.display = 'none';
            }
            const tabPassBtn = document.getElementById('tabViewPass');
            if (tabPassBtn) {
                tabPassBtn.innerHTML = `<span>👑</span> VIP All-Access Pass <span class="view-btn-badge">$0.99/day</span>`;
            }
            if (btnVipGetStarted) {
                btnVipGetStarted.classList.remove('btn-subscribed-dark');
                btnVipGetStarted.innerHTML = `<span>⚡</span> <span>Get VIP Pass ($0.99/day)</span>`;
            }
        }
    }

    async function syncVipStatusFromBackend() {
        try {
            const res = await fetch('/api/v1/payments/orders/lookup');
            if (res.ok) {
                const orders = await res.json();
                if (Array.isArray(orders)) {
                    const activeSub = orders.find(o => 
                        (o.paymentType === 'SUBSCRIPTION' || (o.description && (o.description.toLowerCase().includes('vip') || o.description.toLowerCase().includes('daily')))) &&
                        o.status === 'COMPLETED' &&
                        o.subscriptionStatus !== 'CANCELLED'
                    );
                    if (activeSub) {
                        localStorage.setItem('stripe_ec_vip_active', 'true');
                        localStorage.setItem('stripe_ec_vip_order_ref', activeSub.orderReference);
                    } else {
                        // If no active subscription is returned by backend, clear active VIP state
                        localStorage.setItem('stripe_ec_vip_active', 'false');
                        localStorage.removeItem('stripe_ec_vip_order_ref');
                    }
                    updateVipUI();
                    renderProducts();
                }
            }
        } catch (e) {
            // Backend lookup optional in offline/demo mode
        }
    }

    // ========================================================
    // 3. CART STATE MANAGEMENT
    // ========================================================
    let cart = [];
    try {
        const savedCart = localStorage.getItem('stripe_ec_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            cart.forEach(item => {
                const prod = PRODUCTS.find(p => p.id === item.id);
                if (prod) {
                    item.priceUsd = prod.priceUsd;
                    item.coverImage = prod.coverImage;
                    item.icon = prod.icon;
                }
            });
        }
    } catch (e) {
        cart = [];
    }

    // ========================================================
    // 4. DOM ELEMENTS
    // ========================================================
    const productsGrid = document.getElementById('productsGrid');
    const filterChips = document.querySelectorAll('.filter-chip');
    const btnCurrUSD = document.getElementById('btnCurrUSD');
    const btnCurrKHR = document.getElementById('btnCurrKHR');
    
    // Top-Level Store View Switcher Elements
    const tabViewBuy = document.getElementById('tabViewBuy');
    const tabViewPass = document.getElementById('tabViewPass');
    const catalogView = document.getElementById('catalogView');
    const vipPassView = document.getElementById('vipPassView');
    const checkoutView = document.getElementById('checkoutView');

    // Cart Elements
    const btnOpenCart = document.getElementById('btnOpenCart');
    const btnCloseCart = document.getElementById('btnCloseCart');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartBadge = document.getElementById('cartBadge');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartGrandTotal = document.getElementById('cartGrandTotal');
    const btnCartCheckout = document.getElementById('btnCartCheckout');

    // Navigation Links
    const navHomeBtn = document.getElementById('navHomeBtn');
    const navCheckoutBtn = document.getElementById('navCheckoutBtn');
    const navOrdersBtn = document.getElementById('navOrdersBtn');
    const btnBackToCatalog = document.getElementById('btnBackToCatalog');
    const btnVipBrowseCourses = document.getElementById('btnVipBrowseCourses');
    const btnVipGetStarted = document.getElementById('btnVipGetStarted');

    // Profile Dropdown Elements
    const btnProfileTrigger = document.getElementById('btnProfileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');
    const btnProfileCancelSub = document.getElementById('btnProfileCancelSub');
    const btnVipPassCancel = document.getElementById('btnVipPassCancel');
    const menuLinkHome = document.getElementById('menuLinkHome');

    // Cancellation Modal Elements ("Are you sure?")
    const cancelConfirmationModal = document.getElementById('cancelConfirmationModal');
    const btnKeepSub = document.getElementById('btnKeepSub');
    const btnConfirmCancel = document.getElementById('btnConfirmCancel');

    // Course Reader Modal Elements
    const courseReaderModal = document.getElementById('courseReaderModal');
    const btnCloseReaderModal = document.getElementById('btnCloseReaderModal');
    const readerBookIcon = document.getElementById('readerBookIcon');
    const readerBookTitle = document.getElementById('readerBookTitle');
    const readerSidebarChapters = document.getElementById('readerSidebarChapters');
    const readerContentPane = document.getElementById('readerContentPane');
    let currentReaderBook = null;

    // Payment Form & Tabs Elements
    const tabCardBtn = document.getElementById('tabCardBtn');
    const tabKhqrBtn = document.getElementById('tabKhqrBtn');
    const cardTabPane = document.getElementById('cardTabPane');
    const khqrTabPane = document.getElementById('khqrTabPane');
    const stripePayArea = document.getElementById('stripePayArea');
    const khqrPayArea = document.getElementById('khqrPayArea');
    const btnOpenKhqrModal = document.getElementById('btnOpenKhqrModal');
    const khqrBtnText = document.getElementById('khqrBtnText');
    const paymentForm = document.getElementById('paymentForm');
    const amountInput = document.getElementById('amountInput');
    const amountLabel = document.getElementById('amountLabel');
    const inputCurrencySymbol = document.getElementById('inputCurrencySymbol');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryKhrEquivalent = document.getElementById('summaryKhrEquivalent');
    const payButton = document.getElementById('payButton');
    const buttonSpinner = document.getElementById('buttonSpinner');
    const buttonText = document.getElementById('buttonText');
    const toastBox = document.getElementById('toastBox');
    const checkoutCartItemsBox = document.getElementById('checkoutCartItemsBox');
    const checkoutCartItemsList = document.getElementById('checkoutCartItemsList');
    const stripeMinNotice = document.getElementById('stripeMinNotice');

    // Payment Mode: ONE_TIME vs SUBSCRIPTION
    const btnModeOneTime = document.getElementById('btnModeOneTime');
    const btnModeDaily = document.getElementById('btnModeDaily');
    const dailySubscriptionNotice = document.getElementById('dailySubscriptionNotice');
    let selectedPaymentPlan = 'ONE_TIME'; // 'ONE_TIME' or 'SUBSCRIPTION'

    // KHQR Modal Elements
    const khqrModal = document.getElementById('khqrModal');
    const btnCloseKhqrModal = document.getElementById('btnCloseKhqrModal');
    const modalKhqrAmountRiel = document.getElementById('modalKhqrAmountRiel');
    const modalKhqrAmountUsd = document.getElementById('modalKhqrAmountUsd');
    const khqrCountdown = document.getElementById('khqrCountdown');
    const btnSimulateKhqrScan = document.getElementById('btnSimulateKhqrScan');
    let khqrTimerInterval = null;

    // Product Details Modal Elements
    const productDetailsModal = document.getElementById('productDetailsModal');
    const btnCloseDetailsModal = document.getElementById('btnCloseDetailsModal');
    const detailModalCover = document.getElementById('detailModalCover');
    const detailModalBadge = document.getElementById('detailModalBadge');
    const detailModalRating = document.getElementById('detailModalRating');
    const detailModalCategory = document.getElementById('detailModalCategory');
    const detailModalTitle = document.getElementById('detailModalTitle');
    const detailModalAuthor = document.getElementById('detailModalAuthor');
    const detailModalDesc = document.getElementById('detailModalDesc');
    const detailModalTopics = document.getElementById('detailModalTopics');
    const detailModalSpecs = document.getElementById('detailModalSpecs');
    const detailModalPricePrimary = document.getElementById('detailModalPricePrimary');
    const detailModalPriceSecondary = document.getElementById('detailModalPriceSecondary');
    const btnDetailAddToCart = document.getElementById('btnDetailAddToCart');
    const btnDetailBuyNow = document.getElementById('btnDetailBuyNow');
    let currentDetailProductId = null;

    // ========================================================
    // 5. CURRENCY FORMATTING & CONVERSION (Task 3.3)
    // ========================================================
    function formatCurrency(usdAmount, currency = currentCurrency) {
        const num = parseFloat(usdAmount) || 0;
        if (currency === 'KHR') {
            const khr = Math.round(num * KHR_RATE);
            return `${khr.toLocaleString()} ៛`;
        } else {
            return `$${num.toFixed(2)}`;
        }
    }

    function setCurrency(currency) {
        currentCurrency = currency;
        localStorage.setItem('selected_currency', currency);

        if (currency === 'USD') {
            if (btnCurrUSD) btnCurrUSD.classList.add('active');
            if (btnCurrKHR) btnCurrKHR.classList.remove('active');
            if (inputCurrencySymbol) inputCurrencySymbol.textContent = '$';
            if (amountLabel) amountLabel.textContent = 'Total Due (USD)';
        } else {
            if (btnCurrKHR) btnCurrKHR.classList.add('active');
            if (btnCurrUSD) btnCurrUSD.classList.remove('active');
            if (inputCurrencySymbol) inputCurrencySymbol.textContent = '$';
            if (amountLabel) amountLabel.textContent = 'Total Due (USD equivalent)';
        }

        renderProducts();
        renderCart();
        updateCheckoutSummary();
        updateModalPriceDisplay();
    }

    if (btnCurrUSD) btnCurrUSD.addEventListener('click', () => setCurrency('USD'));
    if (btnCurrKHR) btnCurrKHR.addEventListener('click', () => setCurrency('KHR'));

    // ========================================================
    // 6. STORE VIEW SWITCHER (Buy Individual vs VIP Pass)
    // ========================================================
    function switchStoreView(view) {
        currentStoreView = view;
        
        // Hide checkout view if returning to store
        if (checkoutView) checkoutView.style.display = 'none';

        if (view === 'buy') {
            if (tabViewBuy) tabViewBuy.classList.add('active');
            if (tabViewPass) tabViewPass.classList.remove('active');
            if (catalogView) {
                catalogView.style.display = 'block';
                catalogView.classList.remove('view-fade-in');
                void catalogView.offsetWidth; // trigger reflow
                catalogView.classList.add('view-fade-in');
            }
            if (vipPassView) vipPassView.style.display = 'none';
            if (navHomeBtn) navHomeBtn.classList.add('active');
        } else if (view === 'pass') {
            if (tabViewPass) tabViewPass.classList.add('active');
            if (tabViewBuy) tabViewBuy.classList.remove('active');
            if (catalogView) catalogView.style.display = 'none';
            if (vipPassView) {
                vipPassView.style.display = 'block';
                vipPassView.classList.remove('view-fade-in');
                void vipPassView.offsetWidth; // trigger reflow
                vipPassView.classList.add('view-fade-in');
            }
            if (navHomeBtn) navHomeBtn.classList.add('active');
        }

        if (navOrdersBtn) navOrdersBtn.style.display = 'inline-flex';
        if (navCheckoutBtn) {
            navCheckoutBtn.classList.remove('active');
            navCheckoutBtn.style.display = 'none';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (tabViewBuy) tabViewBuy.addEventListener('click', () => switchStoreView('buy'));
    if (tabViewPass) tabViewPass.addEventListener('click', () => switchStoreView('pass'));
    if (navHomeBtn) {
        navHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchStoreView('buy');
        });
    }
    if (btnVipBrowseCourses) {
        btnVipBrowseCourses.addEventListener('click', () => switchStoreView('buy'));
    }

    // VIP Get Started CTA button
    if (btnVipGetStarted) {
        btnVipGetStarted.addEventListener('click', (e) => {
            const vipState = getVipSubscriptionState();
            if (vipState.isSubscriber) {
                e.preventDefault();
                e.stopPropagation();
                showToast('✓ You are already subscribed to the VIP All-Access Pass! All courses are unlocked.');
                return false;
            }
            // Add VIP Pass item to cart, set mode to subscription and proceed to checkout
            cart = [{
                id: 'plan-daily-vip',
                title: 'VIP Engineering Daily Pass (All-Access)',
                priceUsd: 0.99,
                icon: '🔁',
                coverImage: '/images/covers/daily-vip-pass.jpg',
                quantity: 1
            }];
            saveCart();
            setPaymentPlan('SUBSCRIPTION');
            showCheckoutView();
        });
    }

    // ========================================================
    // 7. PRODUCT CATALOG RENDERING & STUDY METRICS (iOS 27 Cards)
    // ========================================================
    function renderProducts() {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';

        const vipState = getVipSubscriptionState();
        const filtered = PRODUCTS.filter(p => !p.isSubscription && (currentCategory === 'ALL' || p.category === currentCategory));

        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const primaryPrice = formatCurrency(product.priceUsd, currentCurrency);
            const secondaryPrice = currentCurrency === 'USD' 
                ? formatCurrency(product.priceUsd, 'KHR') 
                : formatCurrency(product.priceUsd, 'USD');

            const coverContent = product.coverImage
                ? `<img src="${product.coverImage}" alt="${product.title}" class="product-cover-img" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'product-cover-art\\'>${product.icon}</div>';" />`
                : `<div class="product-cover-art">${product.icon}</div>`;

            // Study duration & savings metrics chip
            const studyDays = product.studyDays || 8;
            const totalVipCost = product.totalVipCost || (studyDays * 0.99);
            const savingsPercent = product.savingsPercent || 65;

            // Action buttons depending on VIP state
            let actionButtonsHtml = '';
            let unlockedBadgeHtml = '';

            if (vipState.isSubscriber) {
                // SUBSCRIBER STATE: Open / Read Online + Buy Lifetime with embedded price
                unlockedBadgeHtml = `<span class="badge-unlocked">✓ UNLOCKED WITH VIP</span>`;
                actionButtonsHtml = `
                    <div class="product-btn-group subscriber-btn-group">
                        <button type="button" class="btn-read-now" data-id="${product.id}" title="Open this course interactive syllabus & code">
                            <span class="btn-icon-text"><span>📖</span> Open</span>
                        </button>
                        <button type="button" class="btn-buy-lifetime-sub" data-id="${product.id}" title="Buy permanent lifetime license & PDF download">
                            <span class="btn-icon-text"><span>💾</span> Lifetime</span>
                            <span class="btn-price-pill">${primaryPrice}</span>
                        </button>
                    </div>
                `;
            } else {
                // NON-SUBSCRIBER STATE: Buy Button with embedded price + VIP Subscribe Button with Hover Tooltip
                actionButtonsHtml = `
                    <div class="product-btn-group">
                        <button type="button" class="btn-add-to-cart" data-id="${product.id}" title="Buy lifetime license for ${primaryPrice}">
                            <span class="btn-icon-text"><span>🛒</span> Buy</span>
                            <span class="btn-price-pill">${primaryPrice}</span>
                        </button>
                        <div class="btn-card-subscribe-wrap">
                            <button type="button" class="btn-card-subscribe" data-id="${product.id}" title="Daily All-Access VIP Pass">
                                <span class="btn-icon-text"><span>👑</span> VIP</span>
                                <span class="btn-sub-pill">$0.99/d</span>
                            </button>
                            <div class="subscribe-hover-tooltip">
                                <div class="tooltip-title">💡 Smart Study Economics</div>
                                <div class="tooltip-body">
                                    Finish this ${studyDays}-day course for just <strong>$${totalVipCost.toFixed(2)}</strong> total with the VIP Daily Pass instead of ${primaryPrice} lifetime. <strong>Save ${savingsPercent}%!</strong>
                                </div>
                                <div class="tooltip-action">Click to view VIP Pass details →</div>
                            </div>
                        </div>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="product-badge-wrap">
                    <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                        <span class="badge-tag ${product.badge}">${product.badgeText}</span>
                        ${unlockedBadgeHtml}
                    </div>
                    <span class="product-rating">★ ${product.rating}</span>
                </div>
                
                <div class="product-cover-box" data-id="${product.id}" title="Click to view full syllabus & details">
                    ${coverContent}
                    <div class="cover-hover-hint"><span>🔍</span> View Details</div>
                </div>

                <h3 class="product-title" data-id="${product.id}" style="cursor: pointer;" title="Click to view details">${product.title}</h3>
                <div class="product-meta">${product.author}</div>
                
                <!-- Course Study Duration & Smart Savings Economics -->
                <div class="card-study-metrics">
                    <span class="chip-study-time">⏱️ ${studyDays} Days to Finish</span>
                    <span class="chip-smart-savings">⚡ VIP: $${totalVipCost.toFixed(2)} (${savingsPercent}% OFF)</span>
                </div>

                <p class="product-desc">${product.description}</p>
                
                <div class="product-card-footer">
                    ${actionButtonsHtml}
                </div>
            `;

            // Event Listeners for Card
            const coverBox = card.querySelector('.product-cover-box');
            if (coverBox) coverBox.addEventListener('click', () => openProductDetailsModal(product.id));

            const titleEl = card.querySelector('.product-title');
            if (titleEl) titleEl.addEventListener('click', () => openProductDetailsModal(product.id));

            // Subscriber action listeners
            const readBtn = card.querySelector('.btn-read-now');
            if (readBtn) {
                readBtn.addEventListener('click', () => openCourseReader(product.id));
            }

            const buyLifetimeBtn = card.querySelector('.btn-buy-lifetime-sub');
            if (buyLifetimeBtn) {
                buyLifetimeBtn.addEventListener('click', () => {
                    addToCart(product.id);
                    buyLifetimeBtn.classList.add('added');
                    buyLifetimeBtn.innerHTML = '<span>✓ Added</span>';
                    setTimeout(() => {
                        buyLifetimeBtn.classList.remove('added');
                        buyLifetimeBtn.innerHTML = `<span class="btn-icon-text"><span>💾</span> Lifetime</span><span class="btn-price-pill">${primaryPrice}</span>`;
                    }, 1200);
                });
            }

            // Non-subscriber action listeners
            const addBtn = card.querySelector('.btn-add-to-cart');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    addToCart(product.id);
                    addBtn.classList.add('added');
                    addBtn.innerHTML = '<span>✓ Added</span>';
                    setTimeout(() => {
                        addBtn.classList.remove('added');
                        addBtn.innerHTML = `<span class="btn-icon-text"><span>🛒</span> Buy</span><span class="btn-price-pill">${primaryPrice}</span>`;
                    }, 1200);
                });
            }

            const cardSubBtn = card.querySelector('.btn-card-subscribe');
            if (cardSubBtn) {
                cardSubBtn.addEventListener('click', () => {
                    switchStoreView('pass');
                });
            }

            const tooltipEl = card.querySelector('.subscribe-hover-tooltip');
            if (tooltipEl) {
                tooltipEl.addEventListener('click', () => {
                    switchStoreView('pass');
                });
            }

            productsGrid.appendChild(card);
        });
    }

    // Category Filter Handler
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.dataset.category;
            renderProducts();
        });
    });

    // ========================================================
    // 8. SHOPPING CART LOGIC & DRAWER UI (Task 3.1)
    // ========================================================
    function saveCart() {
        localStorage.setItem('stripe_ec_cart', JSON.stringify(cart));
        updateCartBadge();
        renderCart();
    }

    function updateCartBadge() {
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) {
            cartBadge.textContent = totalCount;
            cartBadge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
        }
    }

    function addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                priceUsd: product.priceUsd,
                icon: product.icon,
                coverImage: product.coverImage,
                quantity: 1
            });
        }
        saveCart();
        showToast(`"${product.title}" added to cart!`);
    }

    function updateCartItemQuantity(productId, delta) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;

        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        saveCart();
    }

    function removeCartItem(productId) {
        cart = cart.filter(i => i.id !== productId);
        saveCart();
        showToast('Item removed from cart');
    }

    function renderCart() {
        if (!cartItemsList) return;
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="cart-empty-state">
                    <div class="cart-empty-icon">🛍️</div>
                    <h3 style="color: var(--apple-text-primary); margin-bottom: 0.5rem; font-weight: 800;">Your Cart is Empty</h3>
                    <p style="font-size: 0.85rem; color: var(--apple-text-secondary); margin-bottom: 1.5rem;">Browse our developer books and add your favorites to get started.</p>
                </div>
            `;
            if (cartSubtotal) cartSubtotal.textContent = formatCurrency(0);
            if (cartGrandTotal) cartGrandTotal.textContent = formatCurrency(0);
            return;
        }

        let totalUsd = 0;

        cart.forEach(item => {
            const itemTotalUsd = item.priceUsd * item.quantity;
            totalUsd += itemTotalUsd;

            const thumbContent = item.coverImage
                ? `<img src="${item.coverImage}" alt="${item.title}" class="cart-item-img" />`
                : item.icon;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <div class="cart-item-thumb">${thumbContent}</div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-unit-price">${formatCurrency(item.priceUsd)} each</div>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="qty-btn btn-minus" data-id="${item.id}">−</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button type="button" class="qty-btn btn-plus" data-id="${item.id}">+</button>
                    <button type="button" class="btn-remove-item" data-id="${item.id}" title="Remove item">✕</button>
                </div>
            `;

            row.querySelector('.btn-minus').addEventListener('click', () => updateCartItemQuantity(item.id, -1));
            row.querySelector('.btn-plus').addEventListener('click', () => updateCartItemQuantity(item.id, 1));
            row.querySelector('.btn-remove-item').addEventListener('click', () => removeCartItem(item.id));

            cartItemsList.appendChild(row);
        });

        if (cartSubtotal) cartSubtotal.textContent = formatCurrency(totalUsd);
        if (cartGrandTotal) cartGrandTotal.textContent = formatCurrency(totalUsd);
    }

    function openCartDrawer() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCartDrawer() {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (btnOpenCart) btnOpenCart.addEventListener('click', openCartDrawer);
    if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    // ========================================================
    // 9. CHECKOUT PORTAL & NAVIGATION
    // ========================================================
    function showCheckoutView() {
        if (catalogView) catalogView.style.display = 'none';
        if (vipPassView) vipPassView.style.display = 'none';
        if (checkoutView) {
            checkoutView.style.display = 'block';
            checkoutView.classList.remove('view-fade-in');
            void checkoutView.offsetWidth; // trigger reflow
            checkoutView.classList.add('view-fade-in');
        }
        if (navCheckoutBtn) {
            navCheckoutBtn.style.display = 'inline-flex';
            navCheckoutBtn.classList.add('active');
        }
        if (navHomeBtn) navHomeBtn.classList.remove('active');
        if (navOrdersBtn) navOrdersBtn.style.display = 'none';

        populateCheckoutItems();
        updateCheckoutSummary();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function populateCheckoutItems() {
        if (!checkoutCartItemsBox || !checkoutCartItemsList) return;

        if (cart.length === 0) {
            checkoutCartItemsBox.style.display = 'none';
            checkoutCartItemsList.innerHTML = '';
            return;
        }

        checkoutCartItemsBox.style.display = 'block';
        checkoutCartItemsList.innerHTML = cart.map(item => `
            <div class="checkout-cart-item-row">
                <div>
                    <span style="font-weight: 600;">${item.title}</span>
                    <span style="color: var(--apple-text-tertiary); font-size: 0.8rem; margin-left: 0.4rem;">× ${item.quantity}</span>
                </div>
                <div style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">
                    ${currentCurrency === 'KHR' ? `${Math.round(item.priceUsd * item.quantity * KHR_RATE).toLocaleString()} ៛` : `$${(item.priceUsd * item.quantity).toFixed(2)}`}
                </div>
            </div>
        `).join('');

        const hasDailyVip = cart.some(i => i.id === 'plan-daily-vip');
        if (hasDailyVip && cart.length === 1) {
            setPaymentPlan('SUBSCRIPTION');
        } else {
            setPaymentPlan('ONE_TIME');
        }
    }

    function setPaymentPlan(plan) {
        selectedPaymentPlan = plan;
        if (plan === 'SUBSCRIPTION') {
            if (btnModeDaily) {
                btnModeDaily.classList.add('active');
                btnModeDaily.style.background = 'var(--apple-blue)';
                btnModeDaily.style.color = '#fff';
            }
            if (btnModeOneTime) {
                btnModeOneTime.classList.remove('active');
                btnModeOneTime.style.background = 'transparent';
                btnModeOneTime.style.color = 'var(--apple-text-secondary)';
            }
            if (dailySubscriptionNotice) {
                dailySubscriptionNotice.style.display = 'flex';
            }
            if (amountInput) {
                amountInput.value = '0.99';
                amountInput.disabled = true;
            }
            const descInput = document.getElementById('description');
            if (descInput) {
                descInput.value = 'VIP Engineering Daily Pass ($0.99/day recurring)';
            }
        } else {
            if (btnModeOneTime) {
                btnModeOneTime.classList.add('active');
                btnModeOneTime.style.background = 'var(--apple-blue)';
                btnModeOneTime.style.color = '#fff';
            }
            if (btnModeDaily) {
                btnModeDaily.classList.remove('active');
                btnModeDaily.style.background = 'transparent';
                btnModeDaily.style.color = 'var(--apple-text-secondary)';
            }
            if (dailySubscriptionNotice) {
                dailySubscriptionNotice.style.display = 'none';
            }
            if (amountInput) {
                amountInput.disabled = false;
                const total = cart.reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0);
                amountInput.value = total > 0 ? total.toFixed(2) : '29.00';
            }
            const descInput = document.getElementById('description');
            if (descInput) {
                descInput.value = cart.length > 0 ? cart.map(i => `${i.title} (x${i.quantity})`).join(', ') : 'Developer Books & Software Purchase';
            }
        }
        updateCheckoutSummary();
    }

    if (btnModeOneTime) btnModeOneTime.addEventListener('click', () => setPaymentPlan('ONE_TIME'));
    if (btnModeDaily) btnModeDaily.addEventListener('click', () => setPaymentPlan('SUBSCRIPTION'));

    if (btnCartCheckout) {
        btnCartCheckout.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty. Add items first!', true);
                return;
            }
            closeCartDrawer();
            showCheckoutView();
        });
    }

    if (btnBackToCatalog) {
        btnBackToCatalog.addEventListener('click', () => switchStoreView('buy'));
    }

    // ========================================================
    // 10. DUAL PAYMENT METHOD TABS (Card vs KHQR)
    // ========================================================
    let activePaymentMethod = 'card';

    function switchPaymentTab(method) {
        activePaymentMethod = method;

        if (method === 'card') {
            if (tabCardBtn) tabCardBtn.classList.add('active');
            if (tabKhqrBtn) tabKhqrBtn.classList.remove('active');
            if (cardTabPane) cardTabPane.classList.add('active');
            if (khqrTabPane) khqrTabPane.classList.remove('active');
            if (stripePayArea) stripePayArea.style.display = 'block';
            if (khqrPayArea) khqrPayArea.style.display = 'none';
        } else {
            if (tabKhqrBtn) tabKhqrBtn.classList.add('active');
            if (tabCardBtn) tabCardBtn.classList.remove('active');
            if (khqrTabPane) khqrTabPane.classList.add('active');
            if (cardTabPane) cardTabPane.classList.remove('active');
            if (khqrPayArea) khqrPayArea.style.display = 'block';
            if (stripePayArea) stripePayArea.style.display = 'none';
        }
        updateCheckoutSummary();
    }

    if (tabCardBtn) tabCardBtn.addEventListener('click', () => switchPaymentTab('card'));
    if (tabKhqrBtn) tabKhqrBtn.addEventListener('click', () => switchPaymentTab('khqr'));

    if (amountInput) {
        amountInput.addEventListener('input', () => updateCheckoutSummary());
    }

    function updateCheckoutSummary() {
        const val = parseFloat(amountInput ? amountInput.value : 0) || 0;
        const formattedUsd = `$${val.toFixed(2)}`;
        const formattedKhr = `${Math.round(val * KHR_RATE).toLocaleString()} ៛`;

        if (summarySubtotal) {
            summarySubtotal.textContent = currentCurrency === 'KHR' ? formattedKhr : formattedUsd;
        }
        if (summaryTotal) {
            summaryTotal.textContent = currentCurrency === 'KHR' ? formattedKhr : formattedUsd;
        }
        if (summaryKhrEquivalent) {
            summaryKhrEquivalent.textContent = `${formattedKhr} (at 4,100 KHR/USD)`;
        }

        if (buttonText) {
            if (selectedPaymentPlan === 'SUBSCRIPTION') {
                buttonText.textContent = `Subscribe & Pay $0.99 Daily`;
            } else {
                buttonText.textContent = `Pay ${formattedUsd} with Stripe`;
            }
        }
        if (khqrBtnText) {
            khqrBtnText.textContent = `Generate KHQR Code (${formattedKhr})`;
        }

        if (stripeMinNotice) {
            if (val < 0.50 && activePaymentMethod === 'card') {
                stripeMinNotice.style.display = 'flex';
            } else {
                stripeMinNotice.style.display = 'none';
            }
        }
    }

    // ========================================================
    // 11. KHQR MODAL LOGIC (Bakong / ABA)
    // ========================================================
    function openKhqrModal() {
        const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;
        if (amount <= 0) {
            showToast('Please enter a valid amount', true);
            return;
        }

        const khrAmount = Math.round(amount * KHR_RATE);
        if (modalKhqrAmountRiel) modalKhqrAmountRiel.textContent = `${khrAmount.toLocaleString()} ៛`;
        if (modalKhqrAmountUsd) modalKhqrAmountUsd.textContent = `≈ $${amount.toFixed(2)} USD (Rate: 4,100)`;

        if (khqrModal) khqrModal.classList.add('active');
        startKhqrCountdown(300);
    }

    function closeKhqrModal() {
        if (khqrModal) khqrModal.classList.remove('active');
        if (khqrTimerInterval) clearInterval(khqrTimerInterval);
    }

    function startKhqrCountdown(durationSeconds) {
        if (khqrTimerInterval) clearInterval(khqrTimerInterval);
        let remaining = durationSeconds;

        function tick() {
            const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
            const seconds = (remaining % 60).toString().padStart(2, '0');
            if (khqrCountdown) khqrCountdown.textContent = `${minutes}:${seconds}`;

            if (remaining <= 0) {
                clearInterval(khqrTimerInterval);
                if (khqrCountdown) khqrCountdown.textContent = 'EXPIRED';
                showToast('KHQR code expired. Please generate a new one.', true);
            }
            remaining--;
        }

        tick();
        khqrTimerInterval = setInterval(tick, 1000);
    }

    if (btnOpenKhqrModal) btnOpenKhqrModal.addEventListener('click', openKhqrModal);
    if (btnCloseKhqrModal) btnCloseKhqrModal.addEventListener('click', closeKhqrModal);
    if (khqrModal) {
        khqrModal.addEventListener('click', (e) => {
            if (e.target === khqrModal) closeKhqrModal();
        });
    }

    // KHQR Simulation (Test Mode)
    if (btnSimulateKhqrScan) {
        btnSimulateKhqrScan.addEventListener('click', () => {
            btnSimulateKhqrScan.disabled = true;
            btnSimulateKhqrScan.innerHTML = '<span>⏳</span> Verifying Settlement with Bakong...';

            setTimeout(() => {
                const amount = parseFloat(amountInput.value) || 25.00;
                const customerName = document.getElementById('customerName').value.trim() || 'Bakong Customer';
                const customerEmail = document.getElementById('customerEmail').value.trim() || 'customer@example.com';
                const description = document.getElementById('description').value.trim() || 'E-Commerce KHQR Order';
                const isSub = (selectedPaymentPlan === 'SUBSCRIPTION');
                const orderRef = 'ORD-KHQR-' + Date.now().toString(36).toUpperCase();

                const khqrOrder = {
                    orderReference: orderRef,
                    amount: amount,
                    currency: 'USD',
                    status: 'COMPLETED',
                    paymentType: isSub ? 'SUBSCRIPTION' : 'ONE_TIME',
                    subscriptionStatus: isSub ? 'ACTIVE' : null,
                    customerName: customerName,
                    customerEmail: customerEmail,
                    description: description,
                    paymentMethod: 'KHQR (Bakong / ABA)',
                    stripeSessionId: 'KHQR-DOMESTIC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                    createdAt: new Date().toISOString()
                };

                const savedOrders = JSON.parse(localStorage.getItem('stripe_ec_user_orders') || '[]');
                savedOrders.unshift(khqrOrder);
                localStorage.setItem('stripe_ec_user_orders', JSON.stringify(savedOrders));

                if (isSub) {
                    localStorage.setItem('stripe_ec_vip_active', 'true');
                    localStorage.setItem('stripe_ec_vip_order_ref', orderRef);
                }

                cart = [];
                saveCart();
                closeKhqrModal();
                window.location.href = `/success.html?order_ref=${orderRef}&method=khqr`;
            }, 1400);
        });
    }

    // ========================================================
    // 12. STRIPE CHECKOUT FORM SUBMISSION (Task 3.2)
    // ========================================================
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (activePaymentMethod === 'khqr') {
                openKhqrModal();
                return;
            }

            const isRecurring = (selectedPaymentPlan === 'SUBSCRIPTION');
            const amount = isRecurring ? 0.99 : parseFloat(amountInput.value);
            const customerName = document.getElementById('customerName').value.trim();
            const customerEmail = document.getElementById('customerEmail').value.trim();
            const description = document.getElementById('description').value.trim();

            if (!amount || amount < 0.50) {
                showToast('Stripe Card requires minimum $0.50 USD (50¢). Please add items or pay with KHQR!', true);
                if (amountInput) amountInput.focus();
                return;
            }

            if (!customerName) {
                showToast('Please enter your full name.', true);
                return;
            }

            if (!customerEmail || !customerEmail.includes('@')) {
                showToast('Please enter a valid email address.', true);
                return;
            }

            setLoading(true);

            const payload = {
                amount: amount,
                currency: 'USD',
                customerName: customerName,
                customerEmail: customerEmail,
                description: description || (isRecurring ? 'VIP Engineering Daily Pass ($0.99/day recurring)' : 'Payment via Stripe Checkout'),
                isRecurring: isRecurring,
                billingInterval: isRecurring ? 'day' : null
            };

            try {
                const response = await fetch('/api/v1/payments/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to initiate Stripe checkout');
                }

                if (data.checkoutUrl) {
                    cart = [];
                    saveCart();
                    sessionStorage.setItem('lastOrderRef', data.orderReference);
                    window.location.href = data.checkoutUrl;
                } else {
                    throw new Error('No checkout URL returned from payment gateway');
                }
            } catch (error) {
                console.error('Payment Error:', error);
                showToast(error.message || 'Unable to connect to Stripe service.', true);
                setLoading(false);
            }
        });
    }

    function setLoading(isLoading) {
        if (!payButton) return;
        payButton.disabled = isLoading;
        if (isLoading) {
            if (buttonSpinner) buttonSpinner.style.display = 'inline-block';
            if (buttonText) {
                buttonText.textContent = (selectedPaymentPlan === 'SUBSCRIPTION')
                    ? 'Starting Daily VIP Subscription...'
                    : 'Redirecting to Stripe...';
            }
        } else {
            if (buttonSpinner) buttonSpinner.style.display = 'none';
            if (buttonText) {
                if (selectedPaymentPlan === 'SUBSCRIPTION') {
                    buttonText.textContent = 'Subscribe & Pay $0.99 Daily';
                } else {
                    const num = parseFloat(amountInput ? amountInput.value : 29) || 29;
                    buttonText.textContent = `Pay $${num.toFixed(2)} with Stripe`;
                }
            }
        }
    }

    function showToast(message, isError = false) {
        if (!toastBox) return;
        toastBox.textContent = message;
        toastBox.className = 'toast-notification active' + (isError ? ' toast-error' : '');
        toastBox.style.display = 'flex';

        setTimeout(() => {
            toastBox.classList.remove('active');
            setTimeout(() => {
                toastBox.style.display = 'none';
            }, 300);
        }, 3200);
    }

    // ========================================================
    // 13. INTERACTIVE IN-APP COURSE READER MODAL
    // ========================================================
    function openCourseReader(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product || !courseReaderModal) return;

        currentReaderBook = product;
        if (readerBookIcon) readerBookIcon.textContent = product.icon || '📖';
        if (readerBookTitle) readerBookTitle.textContent = product.title;

        // Render chapters in sidebar
        if (readerSidebarChapters) {
            readerSidebarChapters.innerHTML = (product.modules || []).map((mod, idx) => `
                <div class="reader-chapter-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
                    <div class="reader-chapter-num">Chapter ${mod.number || (idx + 1)}</div>
                    <div class="reader-chapter-title">${mod.title}</div>
                </div>
            `).join('');

            // Click listener on chapters
            const chapterItems = readerSidebarChapters.querySelectorAll('.reader-chapter-item');
            chapterItems.forEach(item => {
                item.addEventListener('click', () => {
                    chapterItems.forEach(c => c.classList.remove('active'));
                    item.classList.add('active');
                    const idx = parseInt(item.dataset.idx, 10);
                    renderChapterContent(idx);
                });
            });
        }

        // Render first chapter
        renderChapterContent(0);

        courseReaderModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function renderChapterContent(chapterIndex) {
        if (!currentReaderBook || !readerContentPane) return;
        const mod = (currentReaderBook.modules && currentReaderBook.modules[chapterIndex]) ? currentReaderBook.modules[chapterIndex] : null;

        if (!mod) {
            readerContentPane.innerHTML = `<p>Chapter content coming soon.</p>`;
            return;
        }

        readerContentPane.scrollTop = 0;
        readerContentPane.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <span class="badge-tag" style="background: rgba(0, 113, 227, 0.1); color: var(--apple-blue); font-weight: 800;">
                    CHAPTER ${mod.number || (chapterIndex + 1)}
                </span>
                <h2 style="font-size: 1.85rem; font-weight: 800; color: var(--apple-text-primary); margin: 0.5rem 0 0.75rem 0;">
                    ${mod.title}
                </h2>
                <div style="font-size: 0.88rem; color: var(--apple-text-secondary);">
                    Engineering Series: <strong>${currentReaderBook.title}</strong>
                </div>
            </div>

            <div style="background: var(--apple-bg); border: 1px solid var(--apple-border-subtle); border-radius: var(--radius-xl); padding: 1.5rem; margin-bottom: 2rem;">
                <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--apple-text-primary); margin-bottom: 0.85rem;">
                    Key Architectural Concepts & Deliverables:
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem;">
                    ${mod.topics.map(t => `
                        <li style="display: flex; align-items: start; gap: 0.6rem; font-size: 0.9rem; color: var(--apple-text-secondary);">
                            <span style="color: var(--apple-green-dark); font-weight: 800;">✓</span>
                            <span>${t}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--apple-text-primary); margin-bottom: 0.5rem;">
                Production Implementation Example:
            </h3>
            <p style="font-size: 0.9rem; color: var(--apple-text-secondary); margin-bottom: 1rem;">
                The code below demonstrates the resilience and concurrency baseline covered in this chapter:
            </p>

            <pre class="reader-code-snippet"><code>${escapeHtml(mod.codeSnippet || `// Production Architecture Code Example\n// Included with VIP All-Access Pass\nconsole.log("Ready to build resilient software");`)}</code></pre>

            <div style="margin-top: 2rem; padding: 1.25rem; background: rgba(52, 199, 89, 0.08); border: 1px solid rgba(52, 199, 89, 0.25); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <strong style="color: var(--apple-green-dark); font-size: 0.92rem;">Ready for the next architecture module?</strong>
                    <div style="font-size: 0.8rem; color: var(--apple-text-secondary); margin-top: 0.15rem;">Review code benchmarks and run local test suites.</div>
                </div>
                ${chapterIndex < currentReaderBook.modules.length - 1 ? `
                    <button type="button" class="btn-preset" id="btnNextChapter" style="background: var(--apple-blue); color: #fff; font-weight: 700; padding: 0.55rem 1.1rem;">
                        Next Chapter →
                    </button>
                ` : `<span style="font-weight: 700; color: var(--apple-green-dark); font-size: 0.88rem;">🎉 Course Completed!</span>`}
            </div>
        `;

        const nextBtn = readerContentPane.querySelector('#btnNextChapter');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const nextIdx = chapterIndex + 1;
                const chapterItems = readerSidebarChapters.querySelectorAll('.reader-chapter-item');
                chapterItems.forEach(c => c.classList.remove('active'));
                if (chapterItems[nextIdx]) chapterItems[nextIdx].classList.add('active');
                renderChapterContent(nextIdx);
            });
        }
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function closeCourseReader() {
        if (!courseReaderModal) return;
        courseReaderModal.classList.remove('active');
        document.body.style.overflow = '';
        currentReaderBook = null;
    }

    if (btnCloseReaderModal) btnCloseReaderModal.addEventListener('click', closeCourseReader);
    if (courseReaderModal) {
        courseReaderModal.addEventListener('click', (e) => {
            if (e.target === courseReaderModal) closeCourseReader();
        });
    }

    // ========================================================
    // 14. PROFILE DROPDOWN & "ARE YOU SURE?" CANCELLATION MODAL
    // ========================================================
    if (btnProfileTrigger && profileDropdown) {
        btnProfileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !btnProfileTrigger.contains(e.target)) {
                profileDropdown.classList.remove('active');
            }
        });
    }

    if (menuLinkHome) {
        menuLinkHome.addEventListener('click', (e) => {
            e.preventDefault();
            if (profileDropdown) profileDropdown.classList.remove('active');
            switchStoreView('buy');
        });
    }

    function openCancelConfirmationModal() {
        if (profileDropdown) profileDropdown.classList.remove('active');
        if (cancelConfirmationModal) cancelConfirmationModal.classList.add('active');
    }

    function closeCancelConfirmationModal() {
        if (cancelConfirmationModal) cancelConfirmationModal.classList.remove('active');
    }

    if (btnProfileCancelSub) btnProfileCancelSub.addEventListener('click', openCancelConfirmationModal);
    if (btnVipPassCancel) btnVipPassCancel.addEventListener('click', openCancelConfirmationModal);
    if (btnKeepSub) {
        btnKeepSub.addEventListener('click', () => {
            closeCancelConfirmationModal();
            showToast('VIP All-Access Pass remains active!');
        });
    }

    if (btnConfirmCancel) {
        btnConfirmCancel.addEventListener('click', async () => {
            btnConfirmCancel.disabled = true;
            btnConfirmCancel.textContent = 'Cancelling Pass...';

            const vipState = getVipSubscriptionState();
            const orderRef = vipState.orderReference || 'ALL';

            try {
                const res = await fetch(`/api/v1/payments/subscriptions/${encodeURIComponent(orderRef)}/cancel`, {
                    method: 'POST'
                });
            } catch (err) {
                console.warn('Backend cancel call exception:', err);
            }

            // Clean all local storage subscription markers
            localStorage.setItem('stripe_ec_vip_active', 'false');
            localStorage.removeItem('stripe_ec_vip_order_ref');
            try {
                const localOrders = JSON.parse(localStorage.getItem('stripe_ec_user_orders') || '[]');
                localOrders.forEach(o => {
                    if (o.paymentType === 'SUBSCRIPTION' || (o.description && (o.description.toLowerCase().includes('vip') || o.description.toLowerCase().includes('daily')))) {
                        o.subscriptionStatus = 'CANCELLED';
                    }
                });
                localStorage.setItem('stripe_ec_user_orders', JSON.stringify(localOrders));
            } catch (e) {}

            closeCancelConfirmationModal();
            showToast('VIP Subscription successfully cancelled.');
            
            // Re-render UI immediately
            updateVipUI();
            renderProducts();

            btnConfirmCancel.disabled = false;
            btnConfirmCancel.textContent = '✕ Yes, Cancel Subscription';
        });
    }

    // ========================================================
    // 15. PRODUCT DETAILS MODAL LOGIC
    // ========================================================
    function openProductDetailsModal(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product || !productDetailsModal) return;

        currentDetailProductId = productId;

        if (detailModalCover) {
            detailModalCover.src = product.coverImage || '';
            detailModalCover.alt = product.title;
        }
        const vipState = getVipSubscriptionState();
        const primaryPrice = formatCurrency(product.priceUsd, currentCurrency);
        const detailModalButtonGroup = document.querySelector('.details-button-group');
        const vipShortcutBtn = document.getElementById('btnDetailVipShortcut');

        if (vipState.isSubscriber) {
            if (detailModalBadge) {
                detailModalBadge.className = 'badge-tag badge-unlocked';
                detailModalBadge.textContent = '✓ UNLOCKED WITH VIP';
            }
            if (vipShortcutBtn) vipShortcutBtn.style.display = 'none';
            if (detailModalButtonGroup) {
                detailModalButtonGroup.innerHTML = `
                    <button type="button" class="btn-detail-open-course" id="btnDetailOpenCourse">
                        <span class="btn-icon-text"><span>📖</span> Open Course</span>
                    </button>
                    <button type="button" class="btn-detail-buy-lifetime" id="btnDetailBuyLifetime">
                        <span class="btn-icon-text"><span>💾</span> Lifetime</span>
                        <span class="modal-btn-price-pill" id="detailModalSubLifetimePrice">${primaryPrice}</span>
                    </button>
                `;
                const openBtn = detailModalButtonGroup.querySelector('#btnDetailOpenCourse');
                if (openBtn) {
                    openBtn.addEventListener('click', () => {
                        closeProductDetailsModal();
                        openCourseReader(productId);
                    });
                }
                const buyLifetimeBtn = detailModalButtonGroup.querySelector('#btnDetailBuyLifetime');
                if (buyLifetimeBtn) {
                    buyLifetimeBtn.addEventListener('click', () => {
                        addToCart(productId);
                        buyLifetimeBtn.classList.add('added');
                        buyLifetimeBtn.innerHTML = '<span>✓ Added</span>';
                        setTimeout(() => {
                            buyLifetimeBtn.classList.remove('added');
                            buyLifetimeBtn.innerHTML = `<span class="btn-icon-text"><span>💾</span> Lifetime</span><span class="modal-btn-price-pill" id="detailModalSubLifetimePrice">${formatCurrency(product.priceUsd, currentCurrency)}</span>`;
                        }, 1200);
                    });
                }
            }
        } else {
            if (detailModalBadge) {
                detailModalBadge.className = `badge-tag ${product.badge}`;
                detailModalBadge.textContent = product.badgeText;
            }
            if (vipShortcutBtn) {
                vipShortcutBtn.style.display = 'flex';
                vipShortcutBtn.onclick = () => {
                    closeProductDetailsModal();
                    switchStoreView('pass');
                };
            }
            if (detailModalButtonGroup) {
                detailModalButtonGroup.innerHTML = `
                    <button type="button" class="btn-detail-add-cart" id="btnDetailAddToCart">
                        <span class="btn-icon-text"><span>🛒</span> Add to Cart</span>
                        <span class="modal-btn-price-pill" id="detailModalAddPrice">${primaryPrice}</span>
                    </button>
                    <button type="button" class="btn-detail-buy-now" id="btnDetailBuyNow">
                        <span class="btn-icon-text"><span>⚡</span> Buy Lifetime</span>
                        <span class="modal-btn-price-pill" id="detailModalBuyNowPrice">${primaryPrice}</span>
                    </button>
                `;
                const addCartBtn = detailModalButtonGroup.querySelector('#btnDetailAddToCart');
                if (addCartBtn) {
                    addCartBtn.addEventListener('click', () => {
                        addToCart(productId);
                        addCartBtn.classList.add('added');
                        addCartBtn.innerHTML = '<span>✓ Added</span>';
                        setTimeout(() => {
                            addCartBtn.classList.remove('added');
                            addCartBtn.innerHTML = `<span class="btn-icon-text"><span>🛒</span> Add to Cart</span><span class="modal-btn-price-pill" id="detailModalAddPrice">${formatCurrency(product.priceUsd, currentCurrency)}</span>`;
                        }, 1200);
                    });
                }
                const buyNowBtn = detailModalButtonGroup.querySelector('#btnDetailBuyNow');
                if (buyNowBtn) {
                    buyNowBtn.addEventListener('click', () => {
                        addToCart(productId);
                        closeProductDetailsModal();
                        showCheckoutView();
                    });
                }
            }
        }

        if (detailModalRating) {
            detailModalRating.textContent = `★ ${product.rating}`;
        }
        if (detailModalCategory) {
            detailModalCategory.textContent = product.categoryName || product.category;
        }
        if (detailModalTitle) {
            detailModalTitle.textContent = product.title;
        }
        if (detailModalAuthor) {
            detailModalAuthor.textContent = product.author;
        }
        if (detailModalDesc) {
            detailModalDesc.textContent = product.description;
        }

        if (detailModalTopics) {
            if (product.modules && product.modules.length > 0) {
                detailModalTopics.innerHTML = product.modules.map(mod => `
                    <div class="module-card">
                        <div class="module-card-header">
                            <span class="module-badge">MODULE ${mod.number}</span>
                            <h4 class="module-title">${mod.title}</h4>
                        </div>
                        <ul class="module-topics-list">
                            ${mod.topics.map(t => `
                                <li>
                                    <span class="module-topic-icon">✓</span>
                                    <span>${t}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('');
            } else {
                detailModalTopics.innerHTML = (product.highlights || []).map(topic => `
                    <div class="topic-chip">
                        <span class="topic-check">✓</span>
                        <span>${topic}</span>
                    </div>
                `).join('');
            }
        }

        if (detailModalSpecs && product.specs) {
            detailModalSpecs.innerHTML = `
                <div class="spec-pill">
                    <span class="spec-label">Pages</span>
                    <span class="spec-value">${product.specs.pages}</span>
                </div>
                <div class="spec-pill">
                    <span class="spec-label">Format</span>
                    <span class="spec-value">${product.specs.format}</span>
                </div>
                <div class="spec-pill">
                    <span class="spec-label">Edition</span>
                    <span class="spec-value">${product.specs.edition}</span>
                </div>
                <div class="spec-pill">
                    <span class="spec-label">Level</span>
                    <span class="spec-value">${product.specs.level}</span>
                </div>
            `;
        }

        updateModalPriceDisplay(product);

        productDetailsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateModalPriceDisplay(product = null) {
        if (!product && currentDetailProductId) {
            product = PRODUCTS.find(p => p.id === currentDetailProductId);
        }
        if (!product) return;

        const primaryPrice = formatCurrency(product.priceUsd, currentCurrency);
        const addPriceEl = document.getElementById('detailModalAddPrice');
        if (addPriceEl) addPriceEl.textContent = primaryPrice;
        const buyNowPriceEl = document.getElementById('detailModalBuyNowPrice');
        if (buyNowPriceEl) buyNowPriceEl.textContent = primaryPrice;
        const subLifetimePriceEl = document.getElementById('detailModalSubLifetimePrice');
        if (subLifetimePriceEl) subLifetimePriceEl.textContent = primaryPrice;
    }


    function closeProductDetailsModal() {
        if (!productDetailsModal) return;
        productDetailsModal.classList.remove('active');
        document.body.style.overflow = '';
        currentDetailProductId = null;
    }

    if (btnCloseDetailsModal) btnCloseDetailsModal.addEventListener('click', closeProductDetailsModal);
    if (productDetailsModal) {
        productDetailsModal.addEventListener('click', (e) => {
            if (e.target === productDetailsModal) closeProductDetailsModal();
        });
    }

    // Keyboard ESC Listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (productDetailsModal && productDetailsModal.classList.contains('active')) closeProductDetailsModal();
            if (khqrModal && khqrModal.classList.contains('active')) closeKhqrModal();
            if (cancelConfirmationModal && cancelConfirmationModal.classList.contains('active')) closeCancelConfirmationModal();
            if (courseReaderModal && courseReaderModal.classList.contains('active')) closeCourseReader();
            if (profileDropdown && profileDropdown.classList.contains('active')) profileDropdown.classList.remove('active');
        }
    });

    // ========================================================
    // 16. INITIALIZE ON LOAD
    // ========================================================
    updateVipUI();
    setCurrency(currentCurrency);
    updateCartBadge();
    updateCheckoutSummary();
    syncVipStatusFromBackend();

    const initUrlParams = new URLSearchParams(window.location.search);
    if (initUrlParams.get('checkout') === 'true') {
        showCheckoutView();
    }
});

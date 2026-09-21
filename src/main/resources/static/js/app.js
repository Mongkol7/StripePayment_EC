/**
 * StripePay EC - Storefront & Payment Logic
 * Person 3: Frontend & User Experience (UX/UI) Developer
 */

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================
    // 1. CONSTANTS & PRODUCTS CATALOG (Task 3.1)
    // ========================================================
    const KHR_RATE = 4100; // 1 USD = 4,100 KHR
    let currentCurrency = localStorage.getItem('selected_currency') || 'USD';
    let currentCategory = 'ALL';

    const PRODUCTS = [
        {
            id: 'book-1',
            title: 'Cloud-Native Spring Boot 3 Microservices',
            category: 'BACKEND',
            categoryName: 'Spring Boot 3 & Cloud Architecture',
            author: 'Design, Build & Deploy Resilient Distributed Systems on Kubernetes',
            priceUsd: 0.10,
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
                    title: 'Cloud-Native Core & Java 21',
                    topics: ['Java 21 runtime & Virtual Threads baseline', 'Spring Boot 3 configuration & dependency injection', 'Cloud configuration server & externalized properties']
                },
                {
                    number: '02',
                    title: 'Microservices & Domain Architecture',
                    topics: ['Order, Payment, Inventory, User & Notification services', 'Spring Cloud Gateway dynamic routing & rate limiting', 'Service discovery & health check registries']
                },
                {
                    number: '03',
                    title: 'Event-Driven Messaging with Apache Kafka',
                    topics: ['High-throughput event streaming & message schemas', 'Asynchronous pub/sub choreography between microservices', 'Consumer groups, partition balancing & replay mechanisms']
                },
                {
                    number: '04',
                    title: 'Distributed Transactions & Reliability',
                    topics: ['Saga orchestration pattern for cross-service checkout', 'Transactional Outbox pattern for guaranteed delivery', 'Resilience4j circuit breakers, retries & fallbacks']
                },
                {
                    number: '05',
                    title: 'Observability & Kubernetes Deployment',
                    topics: ['Distributed tracing with OpenTelemetry, Tempo & Grafana', 'Multi-stage Docker builds & Kubernetes manifests', 'Zero-downtime rolling deploys & production liveness probes']
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
            priceUsd: 0.08,
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
                    title: 'High Availability Patterns',
                    topics: ['Global DNS routing & CDN edge static content caching', 'Multi-tier load balancers with active health checks', 'Horizontal web server scaling & stateless sessions']
                },
                {
                    number: '02',
                    title: 'Distributed Caching',
                    topics: ['Redis distributed cache-aside & write-through strategies', 'Cache invalidation, TTL management & stampede protection', 'High-speed session storage & in-memory counters']
                },
                {
                    number: '03',
                    title: 'Database Scaling & Replication',
                    topics: ['Primary DB (Write) & Replica DB (Read) synchronization', 'Database connection pooling & statement tuning', 'Horizontal sharded database clusters for petabyte scale']
                },
                {
                    number: '04',
                    title: 'Rate Limiters & API Gateway',
                    topics: ['Token Bucket, Leaky Bucket & Sliding Window algorithms', 'Distributed rate limiting with Redis atomic operations', 'DDoS defense & client IP throttling']
                },
                {
                    number: '05',
                    title: 'Payment Gateways & Webhooks',
                    topics: ['Dual payment routing (Stripe Visa/Mastercard & PayPal)', 'Asynchronous payment webhooks with cryptographic verification', 'Idempotency keys & exponential backoff retries']
                },
                {
                    number: '06',
                    title: 'Event-Driven Architectures',
                    topics: ['Decoupled message queues with Kafka & RabbitMQ', 'Real-time event streaming for checkout & order ledgers', 'Dead-letter queues (DLQ) & event ordering guarantees']
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
            priceUsd: 0.09,
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
                    title: 'Virtual Threads (Project Loom)',
                    topics: ['Virtual thread basics & lightweight M:N scheduling', 'Thread pinning detection & carrier thread tuning', 'Structured concurrency & Scoped Values in Java 21+']
                },
                {
                    number: '02',
                    title: 'Lock-Free Data Structures',
                    topics: ['Atomic variables, Memory Barriers & Compare-And-Swap (CAS)', 'Concurrent collections internals & cache contention', 'Lock-free single-producer single-consumer queues & stacks']
                },
                {
                    number: '03',
                    title: 'Memory Profiling & GC Tuning',
                    topics: ['VisualVM & Java Flight Recorder (JFR) live telemetry', 'Heap dump analysis & sub-heap memory leak triage', 'Garbage collector optimization: ZGC, Shenandoah & G1']
                },
                {
                    number: '04',
                    title: 'Low-Latency Financial Systems',
                    topics: ['Non-blocking asynchronous I/O (Java NIO)', 'Event-driven ring buffer & LMAX Disruptor pattern', 'Sub-millisecond latency SLAs for order matching engines']
                },
                {
                    number: '05',
                    title: 'Modern Java 21+ Features',
                    topics: ['Pattern matching for switch & exhaustive record patterns', 'Sealed interfaces & mathematical domain models', 'Foreign Function & Memory API (FFM) for off-heap access']
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
            priceUsd: 0.06,
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
                    title: 'Local Containerization',
                    topics: ['Multi-stage Docker builds for minimal image size', 'Distroless & Alpine base image security hardening', 'Non-root execution & Linux kernel capability stripping']
                },
                {
                    number: '02',
                    title: 'Production Helm Charts',
                    topics: ['Helm chart templating, values overrides & secrets injection', 'Release versioning, chart repositories & lifecycle hooks', 'Chart dependency management & sub-charts']
                },
                {
                    number: '03',
                    title: 'CI/CD Automation Pipelines',
                    topics: ['Automated unit, integration & vulnerability scans (Trivy)', 'Secure container image signing with Cosign', 'Automated artifact publishing to private container registries']
                },
                {
                    number: '04',
                    title: 'Zero-Downtime Rolling Deploys',
                    topics: ['Rolling updates, canary releases & blue-green switching', 'Kubernetes liveness, readiness & startup probes', 'Pod disruption budgets & graceful shutdown signal handling']
                },
                {
                    number: '05',
                    title: 'GitOps & Multi-Cluster Orchestration',
                    topics: ['GitOps continuous delivery with ArgoCD sync triggers', 'Multi-cluster orchestration (Cluster 1, Cluster 2, Cluster 3)', 'Automated cluster drift detection & self-healing manifests']
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
            priceUsd: 0.05,
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
                    title: 'Advanced Indexing Strategies',
                    topics: ['B-Tree, Hash, GIN, GiST & BRIN index internals', 'Covering indexes & partial indexes for high-frequency queries', 'Index bloat detection & zero-downtime REINDEX CONCURRENTLY']
                },
                {
                    number: '02',
                    title: 'ACID Transaction Isolation',
                    topics: ['Read Committed, Repeatable Read & Serializable isolation', 'Multi-Version Concurrency Control (MVCC) & vacuum tuning', 'Deadlock detection, transaction serialization anomalies & locks']
                },
                {
                    number: '03',
                    title: 'Foreign Keys & Referential Integrity',
                    topics: ['Cascading delete & update performance implications', 'Foreign key indexing to prevent full table share locks', 'Deferred constraint verification in bulk transactions']
                },
                {
                    number: '04',
                    title: 'High Volume Partition Tables',
                    topics: ['Declarative Range, List & Hash table partitioning', 'Partition pruning & query execution speedups', 'Automated partition creation for time-series order histories']
                },
                {
                    number: '05',
                    title: 'Query Execution Plans & EXPLAIN ANALYZE',
                    topics: ['Reading EXPLAIN ANALYZE cost, buffers & actual time', 'Join strategies: Nested Loop, Hash Join & Merge Join', 'Parallel sequential scans, shared memory & WAL checkpoint tuning']
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
            priceUsd: 0.07,
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
                    title: 'E-Commerce Platform Core',
                    topics: ['Product catalog, shopping cart state & checkout flow', 'Modern responsive frontend with React & Next.js 15', 'User session management & security headers']
                },
                {
                    number: '02',
                    title: 'Dual Payment Gateways',
                    topics: ['Stripe payment gateway for Visa, Mastercard, Apple & Google Pay', 'Cambodian KHQR Bakong integration with live currency conversion', 'Multi-currency settlement between USD and KHR']
                },
                {
                    number: '03',
                    title: 'Real-Time Webhooks Processing',
                    topics: ['Idempotent webhook listener for order, payment & refund events', 'Cryptographic signature verification & anti-tampering', 'Automatic retry queues & dead-letter tracking']
                },
                {
                    number: '04',
                    title: 'Immutable Order Ledger & Invoicing',
                    topics: ['Double-entry financial ledger records in PostgreSQL', 'Instant official PDF tax invoices & receipts download', 'Audit logs for payment reconciliation & dispute resolution']
                },
                {
                    number: '05',
                    title: 'Resilient Micro-Architecture',
                    topics: ['Node.js / NestJS backend with Redis distributed caching', 'Asynchronous message queues with RabbitMQ & AWS SQS', 'Circuit breakers & failover observability']
                },
                {
                    number: '06',
                    title: 'CI/CD & Production DevOps',
                    topics: ['Automated deployment pipelines with Docker containerization', 'Real-time telemetry, structured logging & error monitoring', 'Zero-downtime rolling deploys & high-availability hosting']
                }
            ],
            specs: {
                pages: '460 Pages',
                format: 'PDF + ePub + Full-Stack Starter Kit',
                edition: '2026 E-Commerce Edition',
                level: 'Full-Stack Developers'
            }
        }
    ];

    // Cart state from localStorage
    let cart = [];
    try {
        const savedCart = localStorage.getItem('stripe_ec_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            // Refresh prices from PRODUCTS
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
    // 2. DOM ELEMENTS
    // ========================================================
    const productsGrid = document.getElementById('productsGrid');
    const filterChips = document.querySelectorAll('.filter-chip');
    const btnCurrUSD = document.getElementById('btnCurrUSD');
    const btnCurrKHR = document.getElementById('btnCurrKHR');
    
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

    // Checkout & Tabs Elements
    const tabCardBtn = document.getElementById('tabCardBtn');
    const tabKhqrBtn = document.getElementById('tabKhqrBtn');
    const cardTabPane = document.getElementById('cardTabPane');
    const khqrTabPane = document.getElementById('khqrTabPane');
    const stripePayArea = document.getElementById('stripePayArea');
    const khqrPayArea = document.getElementById('khqrPayArea');
    const btnOpenKhqrModal = document.getElementById('btnOpenKhqrModal');
    const khqrBtnText = document.getElementById('khqrBtnText');

    // Form elements
    const paymentForm = document.getElementById('paymentForm');
    const amountInput = document.getElementById('amountInput');
    const amountLabel = document.getElementById('amountLabel');
    const inputCurrencySymbol = document.getElementById('inputCurrencySymbol');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryKhrEquivalent = document.getElementById('summaryKhrEquivalent');
    const payButton = document.getElementById('payButton');
    const buttonSpinner = document.getElementById('buttonSpinner');
    const toastBox = document.getElementById('toastBox');

    // Dedicated Views Elements (Catalog vs Checkout Portal)
    const catalogView = document.getElementById('catalogView');
    const checkoutView = document.getElementById('checkoutView');
    const navCatalogBtn = document.getElementById('navCatalogBtn');
    const navCheckoutBtn = document.getElementById('navCheckoutBtn');
    const navOrdersBtn = document.getElementById('navOrdersBtn');
    const btnBackToCatalog = document.getElementById('btnBackToCatalog');
    const checkoutCartItemsBox = document.getElementById('checkoutCartItemsBox');
    const checkoutCartItemsList = document.getElementById('checkoutCartItemsList');
    const stripeMinNotice = document.getElementById('stripeMinNotice');

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
    // 3. CURRENCY FORMATTING & LIVE CONVERSION (Task 3.3)
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
            btnCurrUSD.classList.add('active');
            btnCurrKHR.classList.remove('active');
            if (inputCurrencySymbol) inputCurrencySymbol.textContent = '$';
            if (amountLabel) amountLabel.textContent = 'Total Due (USD)';
        } else {
            btnCurrKHR.classList.add('active');
            btnCurrUSD.classList.remove('active');
            if (inputCurrencySymbol) inputCurrencySymbol.textContent = '$';
            if (amountLabel) amountLabel.textContent = 'Total Due (USD equivalent)';
        }

        renderProducts();
        renderCart();
        updateCheckoutSummary();
        updateModalPriceDisplay();
    }

    btnCurrUSD.addEventListener('click', () => setCurrency('USD'));
    btnCurrKHR.addEventListener('click', () => setCurrency('KHR'));

    // ========================================================
    // 4. PRODUCT CATALOG RENDERING & FILTERING (Task 3.1)
    // ========================================================
    function renderProducts() {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';

        const filtered = PRODUCTS.filter(p => currentCategory === 'ALL' || p.category === currentCategory);

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

            card.innerHTML = `
                <div class="product-badge-wrap">
                    <span class="badge-tag ${product.badge}">${product.badgeText}</span>
                    <span class="product-rating">★ ${product.rating}</span>
                </div>
                <div class="product-cover-box" data-id="${product.id}" title="Click to view full syllabus & details">
                    ${coverContent}
                    <div class="cover-hover-hint"><span>🔍</span> View Details</div>
                </div>
                <h3 class="product-title" data-id="${product.id}" style="cursor: pointer;" title="Click to view details">${product.title}</h3>
                <div class="product-meta">${product.author}</div>
                <p class="product-desc">${product.description}</p>
                <div class="product-card-footer">
                    <div class="product-price-box">
                        <span class="price-primary">${primaryPrice}</span>
                        <span class="price-secondary">${secondaryPrice}</span>
                    </div>
                    <div class="product-btn-group">
                        <button type="button" class="btn-view-details" data-id="${product.id}" title="View details and syllabus">
                            <span>ℹ️</span> Details
                        </button>
                        <button type="button" class="btn-add-to-cart" data-id="${product.id}">
                            <span>🛒</span> Add
                        </button>
                    </div>
                </div>
            `;

            const coverBox = card.querySelector('.product-cover-box');
            coverBox.addEventListener('click', () => openProductDetailsModal(product.id));

            const titleEl = card.querySelector('.product-title');
            titleEl.addEventListener('click', () => openProductDetailsModal(product.id));

            const detailsBtn = card.querySelector('.btn-view-details');
            detailsBtn.addEventListener('click', () => openProductDetailsModal(product.id));

            const addBtn = card.querySelector('.btn-add-to-cart');
            addBtn.addEventListener('click', () => {
                addToCart(product.id);
                addBtn.classList.add('added');
                addBtn.innerHTML = '<span>✓</span> Added';
                setTimeout(() => {
                    addBtn.classList.remove('added');
                    addBtn.innerHTML = '<span>🛒</span> Add';
                }, 1200);
            });

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
    // 5. SHOPPING CART LOGIC & DRAWER UI (Task 3.1)
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
                    <h3 style="color: #fff; margin-bottom: 0.5rem;">Your Cart is Empty</h3>
                    <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.5rem;">Browse our developer books and add your favorites to get started.</p>
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

    // Open/Close Drawer Handlers
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
    // 6. VIEW ROUTING: CATALOG VIEW VS. CHECKOUT PORTAL
    // ========================================================
    function showCatalogView() {
        if (catalogView) {
            catalogView.style.display = 'block';
            catalogView.classList.remove('view-fade-in');
            void catalogView.offsetWidth; // trigger reflow
            catalogView.classList.add('view-fade-in');
        }
        if (checkoutView) {
            checkoutView.style.display = 'none';
        }
        if (navCatalogBtn) {
            navCatalogBtn.style.display = 'inline-flex';
            navCatalogBtn.classList.add('active');
        }
        if (navOrdersBtn) {
            navOrdersBtn.style.display = 'inline-flex';
        }
        if (navCheckoutBtn) {
            navCheckoutBtn.classList.remove('active');
            navCheckoutBtn.style.display = 'none';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showCheckoutView() {
        if (catalogView) {
            catalogView.style.display = 'none';
        }
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
        if (navCatalogBtn) {
            navCatalogBtn.classList.remove('active');
            navCatalogBtn.style.display = 'none';
        }
        if (navOrdersBtn) {
            navOrdersBtn.style.display = 'none';
        }

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
                    <span style="color: var(--ios-label-tertiary); font-size: 0.8rem; margin-left: 0.4rem;">× ${item.quantity}</span>
                </div>
                <div style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">
                    ${currentCurrency === 'KHR' ? `${Math.round(item.priceUsd * item.quantity * KHR_RATE).toLocaleString()} ៛` : `$${(item.priceUsd * item.quantity).toFixed(2)}`}
                </div>
            </div>
        `).join('');

        const totalUsd = cart.reduce((sum, i) => sum + (i.priceUsd * i.quantity), 0);
        amountInput.value = totalUsd.toFixed(2);

        const descInput = document.getElementById('description');
        if (descInput) {
            descInput.value = cart.map(i => `${i.title} (x${i.quantity})`).join(', ');
        }
    }

    // Proceed to Checkout from Cart Drawer
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

    // Top Navigation Links for Views
    if (navCatalogBtn) {
        navCatalogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showCatalogView();
        });
    }
    if (navCheckoutBtn) {
        navCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showCheckoutView();
        });
    }
    if (btnBackToCatalog) {
        btnBackToCatalog.addEventListener('click', () => {
            showCatalogView();
        });
    }

    // ========================================================
    // 7. DUAL PAYMENT METHOD TABS (Task 3.2)
    // ========================================================
    let activePaymentMethod = 'card'; // 'card' or 'khqr'

    function switchPaymentTab(method) {
        activePaymentMethod = method;

        if (method === 'card') {
            tabCardBtn.classList.add('active');
            tabKhqrBtn.classList.remove('active');
            cardTabPane.classList.add('active');
            khqrTabPane.classList.remove('active');
            stripePayArea.style.display = 'block';
            khqrPayArea.style.display = 'none';
        } else {
            tabKhqrBtn.classList.add('active');
            tabCardBtn.classList.remove('active');
            khqrTabPane.classList.add('active');
            cardTabPane.classList.remove('active');
            khqrPayArea.style.display = 'block';
            stripePayArea.style.display = 'none';
        }
        updateCheckoutSummary();
    }

    if (tabCardBtn) tabCardBtn.addEventListener('click', () => switchPaymentTab('card'));
    if (tabKhqrBtn) tabKhqrBtn.addEventListener('click', () => switchPaymentTab('khqr'));

    // ========================================================
    // 8. CHECKOUT SUMMARY LOGIC
    // ========================================================
    amountInput.addEventListener('input', () => {
        updateCheckoutSummary();
    });

    function updateCheckoutSummary() {
        const val = parseFloat(amountInput.value) || 0;
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
            buttonText.textContent = `Pay ${formattedUsd} with Stripe`;
        }
        if (khqrBtnText) {
            khqrBtnText.textContent = `Generate KHQR Code (${formattedKhr})`;
        }

        // Stripe minimum requirement helper notice
        if (stripeMinNotice) {
            if (val < 0.50 && activePaymentMethod === 'card') {
                stripeMinNotice.style.display = 'flex';
            } else {
                stripeMinNotice.style.display = 'none';
            }
        }
    }

    // ========================================================
    // 9. SIMULATED KHQR POPUP MODAL LOGIC (Task 3.2)
    // ========================================================
    function openKhqrModal() {
        const amount = parseFloat(amountInput.value) || 0;
        if (amount <= 0) {
            showToast('Please enter a valid amount', true);
            return;
        }

        const khrAmount = Math.round(amount * KHR_RATE);
        if (modalKhqrAmountRiel) modalKhqrAmountRiel.textContent = `${khrAmount.toLocaleString()} ៛`;
        if (modalKhqrAmountUsd) modalKhqrAmountUsd.textContent = `≈ $${amount.toFixed(2)} USD (Standard Rate: 4,100)`;

        khqrModal.classList.add('active');
        startKhqrCountdown(300); // 5 minutes
    }

    function closeKhqrModal() {
        khqrModal.classList.remove('active');
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

    // Simulate Bank Scan & Pay (Test Mode)
    if (btnSimulateKhqrScan) {
        btnSimulateKhqrScan.addEventListener('click', () => {
            btnSimulateKhqrScan.disabled = true;
            btnSimulateKhqrScan.innerHTML = '<span>⏳</span> Verifying Domestic Settlement with Bakong...';

            setTimeout(() => {
                const amount = parseFloat(amountInput.value) || 25.00;
                const customerName = document.getElementById('customerName').value.trim() || 'Bakong Customer';
                const customerEmail = document.getElementById('customerEmail').value.trim() || 'customer@example.com';
                const description = document.getElementById('description').value.trim() || 'E-Commerce KHQR Order';
                
                // Generate a simulated order ref
                const orderRef = 'ORD-KHQR-' + Date.now().toString(36).toUpperCase();

                // Save to local cache for order history lookup
                const khqrOrder = {
                    orderReference: orderRef,
                    amount: amount,
                    currency: 'USD',
                    status: 'COMPLETED',
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

                // Clear cart if items were purchased
                cart = [];
                saveCart();

                closeKhqrModal();
                window.location.href = `/success.html?order_ref=${orderRef}&method=khqr`;
            }, 1500);
        });
    }

    // ========================================================
    // 9. STRIPE PAYMENT SUBMISSION (Task 3.2 Card Tab)
    // ========================================================
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // If in KHQR mode, open the modal instead
        if (activePaymentMethod === 'khqr') {
            openKhqrModal();
            return;
        }

        const amount = parseFloat(amountInput.value);
        const customerName = document.getElementById('customerName').value.trim();
        const customerEmail = document.getElementById('customerEmail').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!amount || amount < 0.50) {
            showToast('Stripe Card requires minimum $0.50 USD (50¢). Please add items to reach $0.50 or pay with KHQR!', true);
            amountInput.focus();
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
            description: description || 'Payment via Stripe Checkout'
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
                // Clear cart locally
                cart = [];
                saveCart();

                // Save order ref for local state if needed
                sessionStorage.setItem('lastOrderRef', data.orderReference);
                // Redirect user to Stripe's hosted checkout page
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

    function setLoading(isLoading) {
        payButton.disabled = isLoading;
        if (isLoading) {
            buttonSpinner.style.display = 'inline-block';
            buttonText.textContent = 'Redirecting to Stripe...';
        } else {
            buttonSpinner.style.display = 'none';
            const num = parseFloat(amountInput.value) || 25;
            buttonText.textContent = `Pay $${num.toFixed(2)} with Stripe`;
        }
    }

    function showToast(message, isError = false) {
        if (!toastBox) return;
        toastBox.textContent = message;
        toastBox.className = 'toast-box active' + (isError ? ' toast-error' : '');
        toastBox.style.display = 'flex';

        setTimeout(() => {
            toastBox.classList.remove('active');
            setTimeout(() => {
                toastBox.style.display = 'none';
            }, 400);
        }, 3500);
    }

    // ========================================================
    // 10. PRODUCT DETAILS MODAL LOGIC
    // ========================================================
    function openProductDetailsModal(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product || !productDetailsModal) return;

        currentDetailProductId = productId;

        if (detailModalCover) {
            detailModalCover.src = product.coverImage || '';
            detailModalCover.alt = product.title;
        }
        if (detailModalBadge) {
            detailModalBadge.className = `badge-tag ${product.badge}`;
            detailModalBadge.textContent = product.badgeText;
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

        // Populate topics / modules
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

        // Populate specs
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

        if (detailModalPricePrimary) {
            detailModalPricePrimary.textContent = formatCurrency(product.priceUsd, currentCurrency);
        }
        if (detailModalPriceSecondary) {
            const secCurrency = currentCurrency === 'USD' ? 'KHR' : 'USD';
            detailModalPriceSecondary.textContent = `≈ ${formatCurrency(product.priceUsd, secCurrency)}`;
        }
    }

    function closeProductDetailsModal() {
        if (!productDetailsModal) return;
        productDetailsModal.classList.remove('active');
        document.body.style.overflow = '';
        currentDetailProductId = null;
    }

    if (btnCloseDetailsModal) {
        btnCloseDetailsModal.addEventListener('click', closeProductDetailsModal);
    }

    if (productDetailsModal) {
        productDetailsModal.addEventListener('click', (e) => {
            if (e.target === productDetailsModal) closeProductDetailsModal();
        });
    }

    if (btnDetailAddToCart) {
        btnDetailAddToCart.addEventListener('click', () => {
            if (!currentDetailProductId) return;
            addToCart(currentDetailProductId);
            btnDetailAddToCart.classList.add('added');
            btnDetailAddToCart.innerHTML = '<span>✓</span> Added to Cart!';
            setTimeout(() => {
                btnDetailAddToCart.classList.remove('added');
                btnDetailAddToCart.innerHTML = '<span>🛒</span> Add to Cart';
            }, 1200);
        });
    }

    if (btnDetailBuyNow) {
        btnDetailBuyNow.addEventListener('click', () => {
            if (!currentDetailProductId) return;
            addToCart(currentDetailProductId);
            closeProductDetailsModal();
            showCheckoutView();
        });
    }

    // Keyboard ESC listener for all modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (productDetailsModal && productDetailsModal.classList.contains('active')) closeProductDetailsModal();
            if (khqrModal && khqrModal.classList.contains('active')) closeKhqrModal();
        }
    });

    // Initialize View
    setCurrency(currentCurrency);
    updateCartBadge();
    updateCheckoutSummary();
});

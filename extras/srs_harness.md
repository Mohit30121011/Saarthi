# N LOGISTIC IMPORT & EXPORT
## Software Requirements Specification
**Document Version:** 1.0
**Technology Stack:** Java · JSP · Servlet · JDBC · MySQL · Bootstrap
**Architecture:** MVC2 | Programming by Contract

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional, non-functional, and data requirements for N Logistic Import & Export — a web-based logistics management platform for container-based import and export operations. It is intended for use by the development team, project guide/reviewer, and stakeholders as the authoritative reference for design, implementation, and testing.

### 1.2 Scope
N Logistic Import & Export enables logistics companies and their customers to manage the complete lifecycle of a container shipment: authentication and role-based access, container movement tracking from origin to destination, profit and loss analysis with categorized loss reasons, container allocation and dynamic pricing with predictive demand graphs, bulk stock/inventory upload, government compliance and billing, supply-chain loss and damage claims, and system-wide barcode-based entry tracking. The platform additionally provides five analytical algorithms — Sales Trend Analysis, ABC (Pareto) Classification, Inventory Turnover Ratio, Product Profitability Analysis, and Demand Forecasting — to support data-driven business decisions.

The system distinguishes two principal categories of actor:
*   **Company (internal users)** — Admin and operations/finance staff who manage containers, shipments, pricing, compliance and billing.
*   **Customer / Consumer (external users)** — businesses or individuals who book shipments, track movement and view their own invoices.

### 1.3 Definitions, Acronyms and Abbreviations
| Term | Meaning |
| :--- | :--- |
| **SRS** | Software Requirements Specification |
| **MVC2** | Model-View-Controller 2 (Servlet-as-Controller design pattern) |
| **PLG** | Profit and Loss Graph |
| **ABC Analysis** | Pareto-based inventory classification into classes A, B and C |
| **CBM** | Cubic Meter — a goods-capacity measure for containers |
| **HSN** | Harmonized System Nomenclature — customs product classification code |
| **KYC** | Know Your Customer |
| **COGS** | Cost of Goods Sold |
| **RBAC** | Role-Based Access Control |
| **TEU** | Twenty-foot Equivalent Unit — standard container capacity measure |

### 1.4 References
*   IEEE 830-1998 — Recommended Practice for Software Requirements Specifications (structural reference)
*   MySQL 8.x Reference Manual
*   Java Servlet 4.0 / JSP 2.3 Specification

---

## 2. Overall Description

### 2.1 Product Perspective
N Logistic Import & Export is a standalone, self-contained multi-tier web application following the MVC2 pattern:
Browser (JSP views, Bootstrap) → Front Controller Servlet → Action/Controller classes → Implementor (JDBC) → MySQL database.

### 2.2 User Classes and Characteristics
| Actor | Description | Access Level |
| :--- | :--- | :--- |
| **Super Admin** | Manages companies, global configuration and algorithm parameters | Full system access |
| **Company Admin** | Manages own company's containers, staff, pricing and compliance | Company-scoped, full |
| **Company Staff — Operations** | Updates container movement, stock and shipping documents | Company-scoped, operational |
| **Company Staff — Finance** | Manages billing, invoices and payments | Company-scoped, billing only |
| **Customer / Consumer** | Books shipments, tracks movement, views own invoices | Self-scoped |

### 2.3 Operating Environment
*   **Application Server:** Apache Tomcat 9.x / 10.x
*   **Database Server:** MySQL 8.x
*   **Client:** Any modern browser (Chrome, Edge, Firefox) — responsive UI via Bootstrap 5

### 2.4 Design and Implementation Constraints
*   Strict MVC2 separation — a single Front Controller Servlet dispatches to Action classes; JSPs are used only for view rendering and contain no business logic.
*   All monetary values are stored as `DECIMAL(12,2)` — never FLOAT/DOUBLE — to avoid rounding errors in profit-and-loss and billing calculations.
*   All date/time fields use `DATE` / `DATETIME` types consistently so that turnover and forecasting calculations remain accurate.
*   Passwords are stored as salted hashes; plain-text storage is not permitted. *(Implementation note: Using SHA-256 in DB layer)*

### 2.5 Assumptions and Dependencies
*   Container GPS/IoT hardware integration is out of scope for this release; movement is updated manually by operations staff at defined checkpoints.
*   The system operates in a single configurable currency to keep profit-and-loss computation consistent.

---

## 3. Functional Requirements

### 3.1 Module 1 — Authentication and Authorization
*   **FR1.1** The system shall provide separate registration workflows for Company and Customer/Consumer accounts.
*   **FR1.2** Company registration requires company name, license/registration number, GST/Tax ID, address and admin contact, and is subject to Super Admin approval before activation.
*   **FR1.3** Customer registration requires name, email, phone, address and a KYC document upload; activation may be automatic or approval-gated (configurable).
*   **FR1.4** The system shall implement Role-Based Access Control with roles: Super Admin, Company Admin, Company Staff (Operations), Company Staff (Finance), and Customer.
*   **FR1.5** Login uses username/email and password; sessions are managed via HttpSession with a configurable timeout (default 30 minutes).
*   **FR1.6** Password reset shall use a time-limited, single-use email OTP or token.
*   **FR1.7** Every controller action shall verify the caller's role/permission before execution (contract precondition).
*   **FR1.8** Repeated failed login attempts shall trigger a temporary account lockout (5 attempts / 15 minutes) to mitigate brute-force attacks.
*   **FR1.9** The system shall log login, logout and permission-denied events to an audit trail.

### 3.2 Module 2 — Container Movement Tracking (Point A → Point B) and Profit & Loss Graph
*   **FR2.1** The system shall allow booking a shipment linking Customer, Container, Origin Port (Point A), Destination Port (Point B) and Vessel.
*   **FR2.2** Shipment movement shall follow a checkpoint-based lifecycle: Booked → Container Allocated → Departed → In Transit → Customs Hold (optional) → Arrived → Delivered.
*   **FR2.3** Every status change shall be timestamped and attributed to the staff user who recorded it.
*   **FR2.4** The system shall present a visual route from origin to destination with the current status marker.
*   **FR2.5** The system shall compute expected versus actual arrival date and automatically flag delay in days.
*   **FR2.6** Profit & Loss Graph (PLG): for each shipment the system shall compute Profit/Loss = Total Revenue (freight + service charges) - Total Cost (fuel, port charges, customs, insurance, damage claims, delay penalties).
*   **FR2.7** Every loss-making shipment shall be tagged against one or more standard Loss Reasons: Traffic in Sea, Weather Condition, Delay, Dock Allocation, Government Legal/Regulatory Hold, War/Geopolitical Disruption, Ship Issue, and Damaged Product.
*   **FR2.8** The PLG shall be rendered as a filterable time-series chart (monthly / quarterly / yearly) by company, route and loss reason, plus a loss-reason breakdown chart (pie/bar).
*   **FR2.9** The system shall allow drill-down from any PLG data point to the underlying shipment record(s).

### 3.3 Module 3 — Container Allocation and Pricing
*   **FR3.1** The system shall maintain a container master catalog including container number, type (Dry, Reefer, Open Top, Flat Rack, Tank), size (20ft / 40ft / 40ft HC / 45ft), image, tare weight, maximum gross weight, goods capacity (kg and CBM), status and current location.
*   **FR3.2** The allocation screen shall display the container image, size and goods capacity to both staff and customers.
*   **FR3.3** The system shall prevent allocation of a container that is not in Available status (contract invariant).
*   **FR3.4** The system shall prevent allocation of cargo whose declared weight or volume exceeds the container's capacity (contract precondition).
*   **FR3.5** A dynamic pricing engine shall compute Final Price = Base Price × Seasonal Multiplier × Demand Multiplier + Surcharges, where the Demand Multiplier is derived from the Demand Forecasting Algorithm (Section 5.5).
*   **FR3.6** The system shall display an Advance Predictive Graph per container type/route showing forecasted demand and price trend for the next N periods (default 6, configurable).
*   **FR3.7** Every price change shall be logged with old value, new value, reason, timestamp and responsible user.

### 3.4 Module 4 — Upload Stock Details
*   **FR4.1** Company staff shall be able to upload stock/inventory details in bulk (CSV/Excel) or via manual entry.
*   **FR4.2** Required stock fields: product name, category, HSN code, unit of measure, quantity, unit cost, unit selling price, warehouse/location, optional batch/lot number and expiry date.
*   **FR4.3** Each uploaded row shall be validated (quantity ≥ 0, unit cost ≥ 0, unit price ≥ 0); invalid rows are rejected with a downloadable error report while valid rows are committed.
*   **FR4.4** The system shall maintain an upload log capturing uploader, timestamp, file name, and success/failure counts for traceability.
*   **FR4.5** Every stock change (upload, sale, adjustment) shall create an inventory ledger entry (IN/OUT with quantity and reference) — required for accurate Inventory Turnover computation.
*   **FR4.6** Stock adjustments for damage or write-off shall require a mandatory reason, feeding into loss reporting and Product Profitability Analysis.

### 3.5 Module 5 — Government Compliance and Billing
*   **FR5.1** The system shall support upload/attachment of compliance documents per shipment: customs declaration, import/export license, certificate of origin, insurance certificate, and inspection certificate.
*   **FR5.2** Each document shall record type, document number, issuing authority, issue date, expiry date, status (Pending / Approved / Rejected / Expired) and file path.
*   **FR5.3** The system shall block a shipment's transition to Departed status until all mandatory compliance documents are Approved and none are expired (contract precondition).
*   **FR5.4** The system shall raise a dashboard/email alert when a compliance document is within 15 days of expiry.
*   **FR5.5** The system shall auto-generate an invoice per shipment including freight charges, service charges, applicable taxes (GST/customs duty) and surcharges.
*   **FR5.6** Invoices shall record invoice number, customer, shipment reference, line items, subtotal, tax amount, total amount, due date and payment status.
*   **FR5.7** The system shall record full or partial payments against invoices with payment mode and transaction reference.
*   **FR5.8** The system shall generate a printable/exportable invoice (PDF) and a billing history report per customer/company, and shall flag overdue invoices automatically.

### 3.6 Module 6 — Analytics Dashboard
*   **FR6.1** The system shall provide role-based dashboards showing active shipments, PLG summary, top loss reasons, container utilization, stock valuation, ABC classification summary, inventory turnover ratio, demand forecast, and invoice aging.
*   **FR6.2** All dashboard charts shall be filterable by date range, company, route, and product/category.

### 3.7 Module 7 — Claim of Loss & Damage (Supply Chain Claims)
Handles customer- or staff-initiated claims for cargo lost, damaged, or short-delivered anywhere in the supply chain, and links each claim back into billing and profit/loss reporting.
*   **FR7.1** The system shall allow a Customer or Company Staff member to file a Loss/Damage claim against a shipment, and optionally against a specific container and/or product line item.
*   **FR7.2** Each claim shall capture: claim type (Loss / Damage / Shortage), affected item(s), quantity/value affected, description of the incident, supporting evidence (photos/documents), date of incident, and — where applicable — a reference to the related Loss Reason defined in Module 2 (Section 3.2).
*   **FR7.3** Each claim shall progress through a defined review workflow: Filed → Under Review → Approved / Rejected → Settled, with transitions restricted to authorized Company Staff (Ops/Finance) or Admin.
*   **FR7.4** The system shall record both `claimed_amount` and `approved_amount`, and an approved claim shall generate a credit note / refund adjustment in the Billing module (Module 5).
*   **FR7.5** A claim shall not be marked Settled until an `approved_amount` is set and a resolution date is recorded (contract precondition).
*   **FR7.6** Every claim status change shall be timestamped and attributed to the responsible staff member, and an Approved/Settled claim shall automatically post as an additional cost against the shipment's Profit & Loss record under its linked Loss Reason.
*   **FR7.7** The system shall provide a Claims Register report, filterable by status, claim type, date range, company and customer.

### 3.8 Module 8 — Barcode-Based Entry Tracking
Applies system-wide: every core record created in the platform is issued a unique barcode for fast physical scanning, lookup, and traceability.
*   **FR8.1** The system shall generate a unique barcode (Code128 or QR) for every core entry created in the system, including — at minimum — container, shipment, stock/inventory item, compliance document, invoice, and claim records.
*   **FR8.2** Each barcode shall encode a unique entity reference (entity type + entity ID) and shall be stored with a link to a scannable barcode image attached to its source record.
*   **FR8.3** The system shall allow staff to scan a barcode (dedicated scanner or camera-based scan) to instantly retrieve and display the corresponding record, supporting fast lookup of containers, stock items and shipments on the warehouse/dock floor.
*   **FR8.4** The system shall support printing/exporting barcodes as labels for physical container tagging and stock shelf labelling.
*   **FR8.5** Every barcode scan event (who scanned, when, which entity, from which module) shall be logged to the audit trail.
*   **FR8.6** The system shall reject creation of a duplicate barcode value for a different entity (contract invariant: `barcode_value` is unique across all entries).

---

## 4. Non-Functional Requirements
| Category | Requirement |
| :--- | :--- |
| **Performance** | Dashboard queries shall return within 3 seconds for up to 100,000 shipment records, using indexed queries and batched DAO calls. |
| **Security** | RBAC enforced server-side on every action; all SQL executed via PreparedStatement; CSRF tokens on state-changing forms; BCrypt password hashing. |
| **Availability** | Target 99% uptime for production deployment. |
| **Scalability** | The DAO layer shall use connection pooling (e.g., HikariCP) to support concurrent company and customer sessions. |
| **Usability** | Bootstrap-based responsive UI with role-based navigation and dual client- and server-side form validation. |
| **Maintainability** | Strict MVC2 separation; one DAO per entity; all business/contract logic resides in the Service layer; no SQL in JSP or Controller. |
| **Auditability** | All create/update/delete operations on financial and compliance entities are recorded in the audit log. |
| **Data Integrity** | Foreign-key constraints enforced at the database level; Design-by-Contract invariants enforced at the Service layer as a second line of defense. |

---

## 5. Analytical Algorithms
The five algorithms below share the same underlying fact tables — `sales_transactions`, `inventory_ledger`, `products`, `shipment` and `profit_loss`. These tables must be retained at full transaction-level detail (never purged after aggregation), or the Turnover, ABC and Forecasting results will silently drift from reality over time.

### 5.1 Sales Trend Analysis Algorithm
*   **Input:** `sales_transactions` grouped by product and period
*   Analyzes historical sales of each product over successive time periods to identify whether demand is growing, declining, or stable, so buying and stocking decisions can be adjusted ahead of time.

### 5.2 ABC Classification Algorithm (Pareto Analysis)
*   **Input:** `sales_transactions` and `products` (revenue per product)
*   Ranks products by their contribution to total revenue and groups them into Class A (high value, tight control), Class B (moderate control) and Class C (low value, loose control), guiding where inventory-control effort should be concentrated.

### 5.3 Inventory Turnover Ratio Algorithm
*   **Input:** `inventory_ledger` (stock movement) and `stock` (period quantities)
*   Measures how efficiently each product moves through inventory over a given period, flagging slow-moving or overstocked items that tie up working capital.

### 5.4 Product Profitability Analysis
*   **Input:** `sales_transactions`, `products` (cost data), and allocated logistics cost from `profit_loss` / `shipment`
*   Evaluates the net profitability of each product after direct cost of goods sold and its share of allocated logistics/shipping cost, producing a ranked profitability report.

### 5.5 Demand Forecasting Algorithm
*   **Input:** Historical `sales_transactions` / shipment booking counts per container type and route, time-bucketed
*   Projects expected demand for upcoming periods per container type and route, driving the Advance Predictive Graph (Module 3, FR3.6) and the Demand Multiplier used in dynamic pricing (FR3.5).

---

## 6. Database Design — Complete Table and Attribute List

### 6.1 User and Access Tables

**Table: roles**
| Attribute | Notes |
| :--- | :--- |
| `role_id (PK)` | Unique role identifier |
| `role_name` | Super Admin / Company Admin / Company Staff Ops / Company Staff Finance / Customer |
| `description` | Free-text description of the role |

**Table: users**
| Attribute | Notes |
| :--- | :--- |
| `user_id (PK)` | Unique user identifier |
| `username` | Login username |
| `email` | Login email, unique |
| `password_hash` | BCrypt salted hash |
| `phone` | Contact number |
| `role_id (FK -> roles)` | Assigned role |
| `company_id (FK -> companies, nullable)` | Populated for company-side users |
| `status` | Active / Inactive / Locked |
| `failed_login_count` | Used for lockout enforcement |
| `last_login_at` | Timestamp of last successful login |
| `created_at / updated_at` | Audit timestamps |

**Table: companies**
| Attribute | Notes |
| :--- | :--- |
| `company_id (PK)` | Unique company identifier |
| `company_name` | Legal/trade name |
| `license_no` | Logistics operating license number |
| `gst_no` | Tax registration number |
| `address` | Registered address |
| `contact_email / contact_phone` | Primary contact details |
| `approval_status` | Pending / Active / Suspended |
| `created_at` | Registration timestamp |

**Table: customers**
| Attribute | Notes |
| :--- | :--- |
| `customer_id (PK)` | Unique customer identifier |
| `user_id (FK -> users)` | Linked login account |
| `customer_name` | Individual or business name |
| `address` | Billing/shipping address |
| `kyc_doc_path` | Path to uploaded KYC document |
| `credit_limit` | Approved credit limit for billing |
| `created_at` | Registration timestamp |

**Table: audit_log**
| Attribute | Notes |
| :--- | :--- |
| `log_id (PK)` | Unique log entry identifier |
| `user_id (FK -> users)` | User who performed the action |
| `action` | Action performed (e.g., LOGIN, STATUS_CHANGE) |
| `entity_name / entity_id` | Affected entity and record |
| `old_value / new_value` | State before/after, where applicable |
| `ip_address` | Client IP address |
| `timestamp` | When the action occurred |

### 6.2 Container and Movement Tables

**Table: ports**
| Attribute | Notes |
| :--- | :--- |
| `port_id (PK)` | Unique port identifier |
| `port_name / port_code` | Name and standard code (e.g., UN/LOCODE) |
| `country` | Country of the port |
| `latitude / longitude` | Geo-coordinates for map display |

**Table: vessels**
| Attribute | Notes |
| :--- | :--- |
| `vessel_id (PK)` | Unique vessel identifier |
| `vessel_name` | Vessel name |
| `imo_number` | International Maritime Organization number |
| `capacity_teu` | Vessel capacity in TEU |

**Table: containers**
| Attribute | Notes |
| :--- | :--- |
| `container_id (PK)` | Unique container identifier |
| `container_number` | ISO container number |
| `type` | Dry / Reefer / Open Top / Flat Rack / Tank |
| `size` | 20ft / 40ft / 40ft HC / 45ft |
| `image_url` | Path/URL to the container image |
| `tare_weight_kg / max_gross_weight_kg`| Weight limits used in allocation checks |
| `goods_capacity_kg / goods_capacity_cbm`| Capacity used in allocation and pricing |
| `status` | Available / Allocated / In-Transit / Under Maintenance |
| `current_port_id (FK -> ports)` | Current location |
| `owner_company_id (FK -> companies)` | Owning company |

**Table: shipment**
| Attribute | Notes |
| :--- | :--- |
| `shipment_id (PK)` | Unique shipment identifier |
| `customer_id (FK -> customers)` | Booking customer |
| `container_id (FK -> containers)` | Allocated container |
| `origin_port_id / destination_port_id (FK -> ports)` | Point A and Point B |
| `vessel_id (FK -> vessels)` | Assigned vessel |
| `booking_date` | Date of booking |
| `cargo_description` | Free-text cargo description |
| `cargo_weight_kg / cargo_volume_cbm` | Declared cargo dimensions — checked against container capacity |
| `cargo_declared_value` | Declared value for insurance/customs |
| `freight_cost / insurance_cost / other_charges` | Cost components used in Profit/Loss |
| `status` | Booked / Container Allocated / Departed / In Transit / Customs Hold / Arrived / Delivered |
| `created_by (FK -> users)` | Staff who created the booking |

**Table: container_movements**
| Attribute | Notes |
| :--- | :--- |
| `movement_id (PK)` | Unique movement record identifier |
| `shipment_id (FK -> shipment)` | Related shipment |
| `status` | Current lifecycle status |
| `checkpoint_location` | Named checkpoint / location |
| `departure_date` | Actual departure date |
| `expected_arrival_date / actual_arrival_date` | Used to compute delay |
| `delay_days` | Derived/stored delay in days |
| `updated_by (FK -> users) / updated_at`| Audit of last update |

### 6.3 Profit and Loss Tables

**Table: loss_reasons**
| Attribute | Notes |
| :--- | :--- |
| `reason_id (PK)` | Unique reason identifier |
| `reason_code / reason_name` | Traffic in Sea, Weather, Delay, Dock Allocation, Government Legal, War, Ship Issue, Damaged Product |
| `description` | Explanatory text |

**Table: profit_loss**
| Attribute | Notes |
| :--- | :--- |
| `pl_id (PK)` | Unique P&L record identifier |
| `shipment_id (FK -> shipment)` | Related shipment |
| `revenue_amount` | Freight + service charges |
| `total_cost_amount` | Fuel, port, customs, insurance, damage, delay penalty |
| `profit_loss_amount` | Derived: revenue_amount - total_cost_amount |
| `record_date` | Date the P&L was recorded |

**Table: profit_loss_reason_map**
| Attribute | Notes |
| :--- | :--- |
| `id (PK)` | Unique mapping identifier |
| `pl_id (FK -> profit_loss)` | Related loss record |
| `reason_id (FK -> loss_reasons)` | Contributing reason |
| `remark` | Optional explanatory note |

### 6.4 Pricing Tables

**Table: pricing_rules**
| Attribute | Notes |
| :--- | :--- |
| `pricing_id (PK)` | Unique pricing rule identifier |
| `container_type / container_size` | Applicable container profile |
| `route_id` | Applicable route |
| `base_price` | Base rate before multipliers |
| `seasonal_multiplier` | Peak-season surcharge factor |
| `demand_multiplier` | Derived from Demand Forecasting Algorithm |
| `final_price` | Computed final price |
| `valid_from / valid_to` | Validity window |

**Table: pricing_audit**
| Attribute | Notes |
| :--- | :--- |
| `audit_id (PK)` | Unique audit entry identifier |
| `pricing_id (FK -> pricing_rules)` | Related pricing rule |
| `old_price / new_price` | Price change values |
| `changed_by (FK -> users) / reason / changed_at`| Who changed it, why, and when |

**Table: demand_forecast**
| Attribute | Notes |
| :--- | :--- |
| `forecast_id (PK)` | Unique forecast record identifier |
| `container_type / route_id` | Forecast scope |
| `forecast_period` | Target period of the forecast |
| `forecasted_demand / forecasted_price` | Algorithm output values |
| `algorithm_version / generated_at` | Traceability of the forecast run |

### 6.5 Product and Stock Tables

**Table: products**
| Attribute | Notes |
| :--- | :--- |
| `product_id (PK)` | Unique product identifier |
| `product_name / category` | Descriptive fields |
| `hsn_code` | Customs classification code |
| `unit_of_measure` | e.g., kg, box, pallet |
| `unit_cost / unit_price` | Current cost and selling price |
| `created_at` | Record creation timestamp |

**Table: stock**
| Attribute | Notes |
| :--- | :--- |
| `stock_id (PK)` | Unique stock record identifier |
| `company_id (FK -> companies)` | Owning company |
| `product_id (FK -> products)` | Related product |
| `warehouse_location` | Storage location |
| `quantity_on_hand` | Current available quantity |
| `batch_no / expiry_date` | Optional, for perishable/batch-tracked goods |
| `last_updated` | Timestamp of last change |

**Table: inventory_ledger**
| Attribute | Notes |
| :--- | :--- |
| `ledger_id (PK)` | Unique ledger entry identifier |
| `product_id (FK -> products)` | Related product |
| `transaction_type` | IN / OUT / ADJUSTMENT |
| `quantity` | Quantity moved |
| `unit_cost_at_txn` | Cost at time of transaction — required for accurate COGS |
| `reference_type / reference_id` | Upload, Sale, Damage, or Return, and its record ID |
| `txn_date` | Transaction date |

**Table: stock_upload_log**
| Attribute | Notes |
| :--- | :--- |
| `upload_id (PK)` | Unique upload batch identifier |
| `company_id (FK -> companies)` | Uploading company |
| `uploaded_by (FK -> users)` | Staff who performed the upload |
| `file_name` | Original file name |
| `total_records / success_count / failure_count`| Upload result summary |
| `error_report_path` | Path to the downloadable error report |
| `uploaded_at` | Upload timestamp |

**Table: sales_transactions**
| Attribute | Notes |
| :--- | :--- |
| `transaction_id (PK)` | Unique transaction identifier |
| `product_id (FK -> products)` | Product sold |
| `customer_id (FK -> customers)` | Purchasing customer |
| `shipment_id (FK -> shipment, nullable)` | Related shipment, if applicable |
| `quantity_sold` | Units sold |
| `sale_price_snapshot` | Price at time of sale — preserves historical accuracy for ABC analysis |
| `sale_amount` | Derived: quantity_sold × sale_price_snapshot |
| `sale_date` | Date of sale |

### 6.6 Compliance and Billing Tables

**Table: compliance_documents**
| Attribute | Notes |
| :--- | :--- |
| `doc_id (PK)` | Unique document identifier |
| `shipment_id (FK -> shipment)` | Related shipment |
| `doc_type` | Customs Declaration / Import License / Export License / Certificate of Origin / Insurance / Inspection |
| `doc_number / issuing_authority`| Document reference details |
| `issue_date / expiry_date` | Validity window — drives expiry alerts |
| `status` | Pending / Approved / Rejected / Expired |
| `file_path` | Path to the uploaded document |
| `uploaded_by (FK -> users)` | Staff who uploaded it |

**Table: billing_invoices**
| Attribute | Notes |
| :--- | :--- |
| `invoice_id (PK)` | Unique invoice identifier |
| `customer_id (FK -> customers)` | Billed customer |
| `shipment_id (FK -> shipment)` | Related shipment |
| `invoice_date / due_date` | Billing dates |
| `subtotal_amount / tax_amount / total_amount`| Financial breakdown |
| `paid_amount` | Sum of payments received so far |
| `payment_status` | Unpaid / Partial / Paid / Overdue |

**Table: invoice_line_items**
| Attribute | Notes |
| :--- | :--- |
| `item_id (PK)` | Unique line item identifier |
| `invoice_id (FK -> billing_invoices)` | Parent invoice |
| `description` | Charge description |
| `quantity / unit_price / line_total` | Line item computation |

**Table: payments**
| Attribute | Notes |
| :--- | :--- |
| `payment_id (PK)` | Unique payment identifier |
| `invoice_id (FK -> billing_invoices)` | Related invoice |
| `payment_date` | Date payment was received |
| `amount_paid` | Amount of this payment |
| `payment_mode` | Bank Transfer / Card / UPI / Cheque |
| `transaction_ref` | Bank/gateway transaction reference |

### 6.7 Claim (Loss & Damage) Tables

**Table: claims**
| Attribute | Notes |
| :--- | :--- |
| `claim_id (PK)` | Unique claim identifier |
| `shipment_id (FK -> shipment)` | Related shipment |
| `container_id (FK -> containers, nullable)`| Related container, if the claim is container-specific |
| `product_id (FK -> products, nullable)`| Related product line item, if the claim is product-specific |
| `customer_id (FK -> customers)` | Claiming customer |
| `claim_type` | Loss / Damage / Shortage |
| `description` | Free-text description of the incident |
| `incident_date` | Date the loss/damage occurred or was discovered |
| `claimed_amount / approved_amount` | Amount claimed versus amount approved after review |
| `reason_id (FK -> loss_reasons, nullable)`| Linked standard loss reason, where applicable |
| `status` | Filed / Under Review / Approved / Rejected / Settled |
| `filed_by (FK -> users) / filed_date` | Who filed the claim and when |
| `resolved_by (FK -> users) / resolved_date`| Who resolved the claim and when |

**Table: claim_documents**
| Attribute | Notes |
| :--- | :--- |
| `doc_id (PK)` | Unique claim-document identifier |
| `claim_id (FK -> claims)` | Parent claim |
| `doc_type` | Photo Evidence / Inspection Report / Other |
| `file_path` | Path to the uploaded evidence file |
| `uploaded_by (FK -> users) / uploaded_at`| Who uploaded it and when |

**Table: claim_status_history**
| Attribute | Notes |
| :--- | :--- |
| `history_id (PK)` | Unique history entry identifier |
| `claim_id (FK -> claims)` | Related claim |
| `old_status / new_status` | Status transition recorded |
| `changed_by (FK -> users) / changed_at`| Who made the change and when |
| `remark` | Optional note explaining the decision |

### 6.8 Barcode Tracking Tables

**Table: barcode_entries**
| Attribute | Notes |
| :--- | :--- |
| `barcode_id (PK)` | Unique barcode record identifier |
| `barcode_value (unique)` | Encoded barcode value — unique across all entries system-wide |
| `barcode_type` | Code128 / QR |
| `entity_type` | Container / Shipment / Stock / ComplianceDocument / Invoice / Claim |
| `entity_id` | ID of the record this barcode represents |
| `image_path` | Path to the generated barcode image, for printing/display |
| `generated_by (FK -> users) / generated_at`| Who generated it and when |

**Table: barcode_scan_log**
| Attribute | Notes |
| :--- | :--- |
| `scan_id (PK)` | Unique scan-event identifier |
| `barcode_id (FK -> barcode_entries)` | Barcode that was scanned |
| `scanned_by (FK -> users)` | Staff member who performed the scan |
| `scanned_at` | Timestamp of the scan |
| `scan_location` | Warehouse/dock/checkpoint where the scan occurred |
| `module_context` | Module the scan was performed from (e.g., Stock, Container Allocation) |

### 6.9 Analytics Result Tables (cached outputs for dashboard performance)

**Table: abc_classification_result**
| Attribute | Notes |
| :--- | :--- |
| `id (PK)` | Unique result identifier |
| `product_id (FK -> products)` | Classified product |
| `revenue_contribution_pct / cumulative_pct`| Pareto computation values |
| `class` | A / B / C |
| `computed_period / computed_at` | Traceability of the computation run |

**Table: inventory_turnover_result**
| Attribute | Notes |
| :--- | :--- |
| `id (PK)` | Unique result identifier |
| `product_id (FK -> products)` | Evaluated product |
| `period` | Evaluation period |
| `cogs_amount / avg_inventory_value` | Inputs to the ratio |
| `turnover_ratio / days_in_inventory`| Computed outputs |
| `computed_at` | Computation timestamp |

**Table: profitability_result**
| Attribute | Notes |
| :--- | :--- |
| `id (PK)` | Unique result identifier |
| `product_id (FK -> products)` | Evaluated product |
| `period` | Evaluation period |
| `revenue / direct_cogs / allocated_logistics_cost`| Cost/revenue components |
| `net_profit / profit_margin_pct` | Computed outputs |

**Table: sales_trend_result**
| Attribute | Notes |
| :--- | :--- |
| `id (PK)` | Unique result identifier |
| `product_id (FK -> products)` | Evaluated product |
| `period` | Evaluation period |
| `actual_sales / moving_avg` | Trend inputs |
| `trend_label` | Growing / Declining / Stable |

---

## 7. Entity Relationship Summary
The key foreign-key relationships across the schema are as follows:
*   `users.role_id -> roles.role_id`
*   `users.company_id -> companies.company_id`
*   `customers.user_id -> users.user_id`
*   `containers.owner_company_id -> companies.company_id`
*   `containers.current_port_id -> ports.port_id`
*   `shipment.customer_id -> customers.customer_id`
*   `shipment.container_id -> containers.container_id`
*   `shipment.origin_port_id / destination_port_id -> ports.port_id`
*   `shipment.vessel_id -> vessels.vessel_id`
*   `container_movements.shipment_id -> shipment.shipment_id`
*   `profit_loss.shipment_id -> shipment.shipment_id`
*   `profit_loss_reason_map.pl_id -> profit_loss.pl_id`
*   `profit_loss_reason_map.reason_id -> loss_reasons.reason_id`
*   `stock.product_id -> products.product_id`
*   `inventory_ledger.product_id -> products.product_id`
*   `sales_transactions.product_id -> products.product_id`
*   `sales_transactions.customer_id -> customers.customer_id`
*   `compliance_documents.shipment_id -> shipment.shipment_id`
*   `billing_invoices.customer_id -> customers.customer_id`
*   `billing_invoices.shipment_id -> shipment.shipment_id`
*   `invoice_line_items.invoice_id -> billing_invoices.invoice_id`
*   `payments.invoice_id -> billing_invoices.invoice_id`
*   `claims.shipment_id -> shipment.shipment_id`
*   `claims.container_id -> containers.container_id`
*   `claims.product_id -> products.product_id`
*   `claims.customer_id -> customers.customer_id`
*   `claims.reason_id -> loss_reasons.reason_id`
*   `claim_documents.claim_id -> claims.claim_id`
*   `claim_status_history.claim_id -> claims.claim_id`
*   `barcode_entries.entity_id -> (Container / Shipment / Stock / ComplianceDocument / Invoice / Claim, per entity_type)`
*   `barcode_scan_log.barcode_id -> barcode_entries.barcode_id`

---

## 8. Use Case Summary

| Use Case | Primary Actor | Preconditions | Postconditions |
| :--- | :--- | :--- | :--- |
| **Register Company** | Company Admin | Valid license/GST information supplied | Company record created, status = Pending |
| **Approve Company** | Super Admin | Company status = Pending | Company status = Active |
| **Book Shipment** | Customer | Logged in; KYC approved | Shipment created, status = Booked |
| **Allocate Container** | Company Staff — Ops | Container status = Available; cargo fits | Container status = Allocated |
| **Update Movement Status** | Company Staff — Ops | Valid transition; documents approved if Departed | Movement status and timestamp updated |
| **View Profit & Loss Graph** | Company Admin / Finance | At least one completed shipment exists | Chart rendered with active filters |
| **Upload Stock** | Company Staff | Valid file format | Stock and ledger updated; upload log created |
| **Upload Compliance Document**| Company Staff | Shipment exists | Document status = Pending |
| **Generate Invoice** | System (automatic) | Shipment booked/delivered | Invoice created |
| **Record Payment** | Finance Staff | Invoice exists; amount > 0 | Invoice `paid_amount` updated; status recalculated |
| **View Demand Forecast** | Company Admin | Sufficient historical data available | Forecast graph rendered |
| **File Loss/Damage Claim** | Customer / Company Staff | Shipment exists | Claim created, status = Filed |
| **Review & Settle Claim** | Company Staff — Ops/Finance| Claim status = Under Review; `approved_amount` set | Claim status = Settled; credit note posted to Billing |
| **Generate Barcode for Entry**| System (automatic) | New core record created | Unique barcode generated and linked to the record |
| **Scan Barcode** | Company Staff | Valid barcode value exists | Corresponding record retrieved and displayed; scan logged |

---

## 9. Future Enhancements
The following items are recognized as valuable extensions but are out of scope for the current release:
*   Real-time GPS/IoT integration for live container tracking
*   Multi-currency support for cross-border billing
*   Companion mobile application for customers and field staff
*   Upgrade of the statistical forecasting model to a machine-learning approach (e.g., regression or ARIMA)

---

## 10. Implementation Standards (Eclipse + JSP/Servlet)

As the backend database schema is finalized, the middle-tier and frontend will be implemented using Java EE technologies within the Eclipse IDE. All development must adhere to the following standards to ensure consistency, maintainability, and strict MVC2 compliance.

### 10.1 Project Structure (Eclipse Dynamic Web Project)
The project will follow the standard Eclipse directory layout for web applications:
*   `src/main/java/` — Contains all Java packages.
    *   `com.nlogistic.model` — POJOs (Plain Old Java Objects) representing database entities.
    *   `com.nlogistic.dao` — Data Access Objects for database interactions (JDBC).
    *   `com.nlogistic.service` — Business logic and contract validation.
    *   `com.nlogistic.controller` — Servlets handling HTTP requests.
    *   `com.nlogistic.util` — Utility classes (e.g., DB connection manager, password hashing).
*   `WebContent/` (or `src/main/webapp/`) — Contains all web resources.
    *   `WEB-INF/web.xml` — Deployment descriptor.
    *   `WEB-INF/lib/` — Third-party JARs (MySQL Connector, JSTL, BCrypt).
    *   `assets/` — CSS, JavaScript, and image files.
    *   `jsp/` — JSP view files (organized by module).

### 10.2 Architectural Pattern: MVC2
*   **Controller (Servlets):** Act as the entry point for all requests. They extract parameters, invoke the appropriate Service/DAO methods, set attributes in the request scope, and forward (`RequestDispatcher`) to the appropriate JSP View.
*   **Model (POJOs & DAOs):** DAOs execute SQL queries via `PreparedStatement` to prevent SQL injection. The Service layer enforces business rules before calling DAOs.
*   **View (JSPs):** Responsible *only* for rendering the UI. **Strict Rule:** No Java scriptlets (`<% ... %>`) are permitted in JSPs. All dynamic data rendering must use JSTL (JavaServer Pages Standard Tag Library) and EL (Expression Language).

### 10.3 Coding and Formatting Guidelines
*   **Naming Conventions:**
    *   Classes: `PascalCase` (e.g., `ShipmentController`, `UserDAO`).
    *   Methods/Variables: `camelCase` (e.g., `getShipmentById`, `customerName`).
    *   Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_LOGIN_ATTEMPTS`).
    *   JSP Files: `kebab-case.jsp` or `snake_case.jsp` (be consistent).
*   **Security & RBAC:**
    *   A central `AuthenticationFilter` (Servlet Filter) must intercept requests to protected URLs, verify the `HttpSession`, and check the user's `role_id` against the required permission for the requested resource.
*   **Resource Management:**
    *   All JDBC resources (`Connection`, `PreparedStatement`, `ResultSet`) must be explicitly closed in a `finally` block or using try-with-resources to prevent memory leaks.
*   **UI/UX Formatting:**
    *   The frontend will use Bootstrap 5 for a responsive, modern layout.
    *   Forms must implement dual validation: client-side (HTML5/JavaScript) for immediate feedback, and server-side (Java) for security integrity.

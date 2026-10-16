# Discovered controls (16 Oct 2026)

From `node discover-interactions.js` + `--reclassify`. 2,163 controls found on 61 signed-in screens; 586 will be clicked in stage 2. Full detail (including every skipped control and its reason) is in `interactions.json`.

**Home dashboard** `/`: 10 to click, 3 skipped
- Tabs (2): Featured resource, From YouTube
- Dropdowns (3): 59, Account menu for Muhammad Arqum c Mu…, All
- Buttons (5): Search pages and people, Request leave, All news, 21 Feb 2020 Where can I get some? WH…, Play VentureDive Core Values

**My Leaves** `/leaves`: 11 to click, 22 skipped
- Tabs (5): My Leaves, Team Dashboard, Company-wide Dashboard, List view, Table view
- Dropdowns (2): All, Rows per page
- Buttons (2): Apply Leave, View Annual request details
- Pagination (2): 2, Next

**Team - Leave Requests** `/leaves?tab=requests`: 16 to click, 9 skipped
- Tabs (13): My Leaves, Team Dashboard, Company-wide Dashboard, Leave Requests, Leave Calendar, Quota, List view, Table view, Project Manager, Line Manager, CTO, CEO, … (+1 more)
- Dropdowns (2): All Types, Rows per page
- Search (1): Search employee

**Team - Leave Calendar** `/leaves?tab=calendar`: 10 to click, 0 skipped
- Tabs (6): My Leaves, Team Dashboard, Company-wide Dashboard, Leave Requests, Leave Calendar, Quota
- Dropdowns (1): Month
- Buttons (3): Today, Previous, Next

**Team - Quota** `/leaves?tab=quota`: 12 to click, 7 skipped
- Tabs (8): My Leaves, Team Dashboard, Company-wide Dashboard, Leave Requests, Leave Calendar, Quota, List view, Table view
- Dropdowns (2): Direct Reporting, Rows per page
- Sort (1): EMPLOYEE
- Column filters (1): Filter Employee

**Company - Leave Quotas** `/leaves?view=company&tab=leave-quotas`: 14 to click, 16 skipped
- Tabs (8): My Leaves, Team Dashboard, Company-wide Dashboard, Leave Quotas, All Leaves, Leave Adjustments, List view, Table view
- Dropdowns (2): Active Employees, Rows per page
- Sort (1): EMPLOYEE
- Column filters (1): Filter Employee
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Company - All Leaves** `/leaves?view=company&tab=all-leaves`: 14 to click, 28 skipped
- Tabs (8): My Leaves, Team Dashboard, Company-wide Dashboard, Leave Quotas, All Leaves, Leave Adjustments, List view, Table view
- Dropdowns (2): Active Employees, Rows per page
- Buttons (2): Columns (12/12), View Sehar Nasim request details
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Company - Leave Adjustments** `/leaves?view=company&tab=adjustments`: 15 to click, 23 skipped
- Tabs (8): My Leaves, Team Dashboard, Company-wide Dashboard, Leave Quotas, All Leaves, Leave Adjustments, List view, Table view
- Dropdowns (2): Active Employees, Rows per page
- Buttons (2): Adjust Leave Quota, View adjustment for Aayan Ali
- Column filters (1): Filter Employee
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**My Claims** `/claims?tab=my`: 15 to click, 18 skipped
- Tabs (7): My Claims, Team Claims, All Claims, Company Claims, FAQs, List view, Table view
- Dropdowns (2): All, Rows per page
- Search (1): Search claims
- Buttons (2): New Claim, View claim 1787
- Column filters (1): Filter ID
- Pagination (2): 2, Next

**Team Claims** `/claims?tab=team`: 14 to click, 26 skipped
- Tabs (7): My Claims, Team Claims, All Claims, Company Claims, FAQs, List view, Table view
- Dropdowns (2): All, Rows per page
- Search (1): Search claims
- Buttons (1): View claim 1204
- Column filters (1): Filter ID
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**FAQs** `/claims?tab=faqs`: 6 to click, 5 skipped
- Tabs (5): My Claims, Team Claims, All Claims, Company Claims, FAQs
- Buttons (1): What type of expenses can be claimed?

**My Goals** `/my-performance/goals`: 11 to click, 35 skipped
- Tabs (5): Active Goals, Completed Goals, Rejected/Deleted Goals, List view, Table view
- Dropdowns (1): Rows per page
- Buttons (3): Add New Goal, Edit goal, View goal
- Pagination (2): 2, Next

**My Performance Review** `/my-performance/reviews`: 7 to click, 22 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (2): Columns (8/8), Self view
- Pagination (2): 2, Next

**Team Performance** `/lm-dashboard/performance-management`: 16 to click, 28 skipped
- Tabs (10): Goals Dashboard, Forms Dashboard, Goals Approval Status, Self Evaluation Status, LM Evaluation Status, PM Forms Approval Status, Calibration, All, Direct Reporting, Indirect Reporting
- Dropdowns (1): Rows per page
- Buttons (2): View goal, Scroll tabs right
- Column filters (1): Filter Employee ID
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**View Cycles** `/pc/performance-cycles`: 6 to click, 17 skipped
- Dropdowns (2): Due date (newest first), Rows per page
- Search (1): Search performance cycles
- Buttons (1): View
- Pagination (2): 2, Next

**CRMC Panel** `/pc/performance-cycles-crmc`: 8 to click, 11 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (2): Add new Cycle, Columns (4/4)
- Column filters (1): Filter Cycle
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Project Reporting** `/pc/project-reviews`: 6 to click, 10 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Column filters (1): Filter Cycle
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Individual Reporting** `/employee-ratings`: 5 to click, 6 skipped
- Tabs (2): List view, Table view
- Dropdowns (2): Select Cycle, Rows per page
- Buttons (1): Columns (1/1)
- Not clicked (unsafe): Export

**Employee Directory** `/employee-directory`: 56 to click, 20 skipped
- Tabs (52): All, QA, QA Automation, Visual, Web, Backend, Android, .NET245, Admin, Advisory, Amazon Web Services, Architecture, … (+40 more)
- Search (1): Search name, designation or email
- Buttons (3): Show all 51, Copy email, View More

**Organization Chart** `/employee-organization-tree`: 9 to click, 10 skipped
- Search (1): Search employees by name
- Buttons (8): 29 Total, Muhammad Osama, Kumail Abbas, Motasim Hussain, Anas Ahmed, Baqir A bin Altaf A, nosheen sikandar, fariha khan

**My Profile** `/profile`: 13 to click, 5 skipped
- Tabs (12): Employee Info, Tracking, Bonus, VSOP, Talent Management, Employment History, Documents, Basic Info, Personal Info, Family Info, Education History, Certificates & Trainings
- Buttons (1): Show value
- Not clicked (unsafe): Change profile picture

**All Employees** `/employees/all`: 12 to click, 22 skipped
- Tabs (5): List view, Table view, All 1914, Active 1196, Inactive 718
- Dropdowns (1): Rows per page
- Buttons (2): Add New Employee, Columns (12/12)
- Sort (1): NAME
- Column filters (1): Filter Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Downloads, Employee Info Bulk Upload, Export

**Current Employees** `/crmc/employees/current`: 8 to click, 24 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (1): Columns (16/16)
- Sort (1): NAME
- Column filters (1): Filter Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Inactive Employees** `/crmc/employees/inactive`: 9 to click, 30 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (2): Columns (16/16), 4 More
- Sort (1): NAME
- Column filters (1): Filter Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Billable Resources** `/crmc/employees/billable`: 15 to click, 38 skipped
- Tabs (7): List view, Table view, Bench, Internal, Backup, Billed, Billed Additional
- Dropdowns (2): Select date, Rows per page
- Buttons (2): Columns (22/22), View a8 c b details
- Sort (1): NAME
- Column filters (1): Filter Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Non-Billable Resources** `/crmc/employees/non-billable`: 8 to click, 23 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (1): Columns (15/15)
- Sort (1): NAME
- Column filters (1): Filter Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Current Projects** `/crmc/projects/current`: 9 to click, 39 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (2): Add New Projects, Columns (31/31)
- Sort (1): PROJECT NAME
- Column filters (1): Filter Project Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Export Cost Projections

**Completed Projects** `/crmc/projects/completed`: 8 to click, 49 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (1): Columns (32/32)
- Sort (1): PROJECT NAME
- Column filters (1): Filter Project Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Export Cost Projections, Re-activate project

**Transient Resources** `/resourcePlanner/transientResource`: 11 to click, 26 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (4): Add New Resource, Columns (14/14), Edit, 1 More
- Sort (1): FIRST NAME
- Column filters (1): Filter First Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Deals Summary** `/deals`: 13 to click, 41 skipped
- Tabs (2): List view, Table view
- Dropdowns (3): Start date, End date, Rows per page
- Buttons (4): Total Deals 114, Search, Columns (13/13), Kearney - Technology Delivery Staff …
- Sort (1): BUSINESS UNIT
- Column filters (1): Filter Business Unit
- Pagination (2): 2, Next
- Not clicked (unsafe): Sync Now, Run Planner, Export

**Resource Deficit** `/resourcePlanner/reports/resource-deficit`: 10 to click, 14 skipped
- Tabs (2): List view, Table view
- Dropdowns (4): Select End Date, !@#$%^&*()_)(*&^%$#@#$%^&*(*&^%$#!@#…, Aion - Alinma - Sales Funnel Opt + P…, Rows per page
- Buttons (4): Clear date, Search, Columns (7/7), Google Flutter
- Not clicked (unsafe): Export

**Bench Summary** `/resourcePlanner/reports/bench-summary`: 13 to click, 116 skipped
- Tabs (2): List view, Table view
- Dropdowns (5): Select date, Table, Sum, aggregate, Rows per page
- Buttons (4): Clear date, aggregate, 2.00, Columns (13/13)
- Sort (1): NAME
- Column filters (1): Filter Name

**Resource Utilization** `/billing`: 12 to click, 22 skipped
- Tabs (4): By Project, By Employee, List view, Table view
- Dropdowns (2): Select month, Rows per page
- Buttons (4): Columns (10/10), Filters, Sort by Name, Filter Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Employee Certificates** `/employees/certificates`: 7 to click, 20 skipped
- Dropdowns (1): Rows per page
- Buttons (1): Columns (13/13)
- Sort (2): EMPLOYEE NAME, DAYS TILL EXPIRY
- Column filters (1): Filter Employee Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Market Values** `/market-values`: 8 to click, 17 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (3): Add New Market Value, Columns (4/4), Edit 2,058
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Employee Grants** `/employee-grants`: 8 to click, 29 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (2): Columns (11/11), View Grant 1 details
- Column filters (1): Filter Employee ID
- Pagination (2): 2, Next
- Not clicked (unsafe): Employee Grant Bulk Upload, Assign New Grants, Export

**Quarterly Cycles** `/grant-cycles`: 8 to click, 17 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (3): Add New Cycle, Columns (5/5), Edit
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Exercise & Buyback** `/vsop-transactions`: 5 to click, 16 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (1): Columns (10/10)
- Column filters (1): Filter Employee ID
- Not clicked (unsafe): Transactions Bulk Upload

**All Goals** `/goals`: 11 to click, 32 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (5): Add New Goal, Columns (10/10), Add Filter, View, Edit
- Column filters (1): Filter ID
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete

**Predefined Goals** `/predefined-goals`: 8 to click, 36 skipped
- Dropdowns (1): Rows per page
- Buttons (4): Add New Goal, Columns (4/4), View, Edit
- Column filters (1): Filter Goal Title
- Pagination (2): 2, Next
- Not clicked (unsafe): Delete

**Goal Categories** `/goals-categories`: 4 to click, 97 skipped
- Search (1): Search categories
- Buttons (3): Add New Category, View, Edit
- Not clicked (unsafe): Delete

**Monthly Competencies** `/monthly-competencies`: 3 to click, 26 skipped
- Search (1): Search competencies
- Buttons (2): Add New Competency, Ownership
- Not clicked (unsafe): Export

**Bi-Annual Competencies** `/bi-annual-competencies`: 3 to click, 13 skipped
- Search (1): Search competencies
- Buttons (2): Add New Competency, Leadership & People Development
- Not clicked (unsafe): Export, QA Edit-Save Bi-Annual

**Performance Management** `/performance-management`: 9 to click, 9 skipped
- Tabs (4): Active Performance Cycle, Completed Performance Cycle, List view, Table view
- Dropdowns (1): Rows per page
- Buttons (3): Launch New Performance Cycle, View details, Edit
- Column filters (1): Filter Title
- Not clicked (unsafe): Close cycle, Delete

**PM Dashboard** `/pm-admin-dashboard`: 17 to click, 142 skipped
- Tabs (7): Goals Approval Status, Self Evaluation Status, LM Evaluation Status, PM Forms Approval Status, Calibration, Promotion, Training
- Dropdowns (3): Table, Count, Rows per page
- Buttons (3): businessUnit, 4, Columns (9/9)
- Sort (2): ID, TOTAL WEIGHTAGE
- Column filters (2): Filter ID, Filter Total Weightage

**Roles** `/roles`: 8 to click, 32 skipped
- Dropdowns (1): Rows per page
- Search (1): Search roles
- Buttons (4): Add New Role, Edit !@#$%^&*()(*&^%$#@!@#$%^&*()(*&…, Manage users for !@#$%^&*()(*&^%$#@!…, Manage permissions for !@#$%^&*()(*&…
- Pagination (2): 2, Next
- Not clicked (unsafe): Export

**Skills** `/skills`: 6 to click, 27 skipped
- Dropdowns (1): Rows per page
- Search (1): Search skills
- Buttons (2): Add New Skill, Edit Automation Demoss 23456
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Employment Types** `/employment-types`: 4 to click, 23 skipped
- Dropdowns (1): Rows per page
- Search (1): Search employment types
- Buttons (2): Add New Employment Type, Edit Contractu
- Not clicked (unsafe): Export, Delete (per row)

**Departments** `/departments`: 6 to click, 27 skipped
- Dropdowns (1): Rows per page
- Search (1): Search departments
- Buttons (2): Add New Department, Edit .NET245
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Currencies** `/currencies`: 4 to click, 9 skipped
- Dropdowns (1): Rows per page
- Search (1): Search currencies
- Buttons (2): Add New Currency, Edit fs dfsdf sdfsf sdf;sdlkfk sl ka…
- Not clicked (unsafe): Export, Delete (per row)

**Overhead Costs** `/overhead-costs`: 4 to click, 1 skipped
- Tabs (2): Overhead Costs, Exchange Rates
- Search (1): Search overhead costs
- Buttons (1): Add Overhead Cost

**Companies** `/companies`: 6 to click, 22 skipped
- Dropdowns (1): Rows per page
- Search (1): Search companies
- Buttons (2): Add New Company, Edit 51Peg
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Industries** `/industries`: 6 to click, 22 skipped
- Dropdowns (1): Rows per page
- Search (1): Search industries
- Buttons (2): Add New Industry, Edit ^&(*()**)((*&^&^%%^$^$%#%$##$@@…
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Customers** `/customers`: 11 to click, 42 skipped
- Tabs (2): List view, Table view
- Dropdowns (1): Rows per page
- Buttons (4): Add New, View logs for .bcd, Edit .bcd, Edit .c for ticket testing
- Sort (1): NAME
- Column filters (1): Filter Name
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Designations** `/designations`: 6 to click, 27 skipped
- Dropdowns (1): Rows per page
- Search (1): Search designations
- Buttons (2): Add New Designation, Edit ^^*^&^%^#$##!@!@$%(*(*&*%$@#@!#…
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Locations** `/locations`: 6 to click, 22 skipped
- Dropdowns (1): Rows per page
- Search (1): Search locations
- Buttons (2): Add New Location, Edit 7564367827689785798898777637867…
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Competencies** `/competencies`: 6 to click, 26 skipped
- Dropdowns (1): Rows per page
- Search (1): Search competencies
- Buttons (2): Add New Competency, Edit ^&**&^%$
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Business Units** `/business-unit`: 6 to click, 22 skipped
- Dropdowns (1): Rows per page
- Search (1): Search business units
- Buttons (2): Add New Business Unit, Edit !@#$%^&*()_)(*&^%$#@#$%^&*(*&^%…
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Divisions** `/division`: 6 to click, 25 skipped
- Dropdowns (1): Rows per page
- Search (1): Search divisions
- Buttons (2): Add New Division, Edit 6785632485983
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row), Edit (per row)

**Project Roles** `/project-roles`: 6 to click, 26 skipped
- Dropdowns (1): Rows per page
- Search (1): Search project roles
- Buttons (2): Add New Role, Edit !@#$%^&*()(*&^%$#@!@#$%^&*()(*&…
- Pagination (2): 2, Next
- Not clicked (unsafe): Export, Delete (per row)

**Leave Models** `/leave-models`: 2 to click, 5 skipped
- Search (1): Search leave models
- Buttons (1): Standard Leave Model
- Not clicked (unsafe): Export

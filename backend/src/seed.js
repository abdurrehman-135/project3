import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDatabase } from "./config/db.js";
import Activity from "./models/Activity.js";
import Notification from "./models/Notification.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import User from "./models/User.js";


dotenv.config();

const relativeDate = (daysFromToday, hour = 17, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const users = [
  {
    key: "ava",
    name: "Ava Patel",
    email: "ava.patel@taskflow.demo",
    password: "password123",
    role: "admin",
    title: "Product Operations Director",
  },
  {
    key: "marcus",
    name: "Marcus Reed",
    email: "marcus.reed@taskflow.demo",
    password: "password123",
    role: "manager",
    title: "Delivery Manager",
  },
  {
    key: "nina",
    name: "Nina Okafor",
    email: "nina.okafor@taskflow.demo",
    password: "password123",
    role: "manager",
    title: "Engineering Lead",
  },
  {
    key: "sofia",
    name: "Sofia Chen",
    email: "sofia.chen@taskflow.demo",
    password: "password123",
    role: "member",
    title: "Senior Product Designer",
  },
  {
    key: "leo",
    name: "Leo Martinez",
    email: "leo.martinez@taskflow.demo",
    password: "password123",
    role: "member",
    title: "Full Stack Engineer",
  },
  {
    key: "priya",
    name: "Priya Shah",
    email: "priya.shah@taskflow.demo",
    password: "password123",
    role: "member",
    title: "QA Automation Engineer",
  },
  {
    key: "ethan",
    name: "Ethan Brooks",
    email: "ethan.brooks@taskflow.demo",
    password: "password123",
    role: "member",
    title: "Data Analyst",
  },
  {
    key: "grace",
    name: "Grace Kim",
    email: "grace.kim@taskflow.demo",
    password: "password123",
    role: "member",
    title: "Customer Success Lead",
  },
];

const projectSeeds = [
  {
    key: "clientPortal",
    name: "Client Portal Redesign",
    description:
      "Rebuild the client-facing portal around faster onboarding, clearer project visibility, permission-aware collaboration, and a polished executive reporting experience.",
    status: "in-progress",
    priority: "critical",
    dueInDays: 21,
    budget: 86000,
    category: "Customer Experience",
    color: "indigo",
    ownerKey: "marcus",
    memberKeys: ["ava", "marcus", "sofia", "leo", "priya", "grace"],
  },
  {
    key: "mobileRelease",
    name: "Mobile Release 2.4",
    description:
      "Ship a reliability-focused mobile update with offline task capture, push notification preferences, faster board loading, and a cleaner release validation path.",
    status: "in-progress",
    priority: "high",
    dueInDays: 14,
    budget: 52000,
    category: "Product Engineering",
    color: "emerald",
    ownerKey: "nina",
    memberKeys: ["ava", "nina", "sofia", "leo", "priya"],
  },
  {
    key: "analyticsHub",
    name: "Revenue Analytics Hub",
    description:
      "Create a shared analytics workspace for pipeline health, renewal risk, delivery margin, and weekly operating metrics across leadership and customer-facing teams.",
    status: "planning",
    priority: "high",
    dueInDays: 45,
    budget: 74000,
    category: "Data Platform",
    color: "amber",
    ownerKey: "ethan",
    memberKeys: ["ava", "marcus", "nina", "ethan", "grace"],
  },
  {
    key: "supportAutomation",
    name: "Support Automation Pilot",
    description:
      "Pilot a support automation workflow that classifies inbound requests, drafts first responses, routes escalations, and measures time saved without weakening service quality.",
    status: "blocked",
    priority: "medium",
    dueInDays: 10,
    budget: 28000,
    category: "Operations",
    color: "rose",
    ownerKey: "grace",
    memberKeys: ["ava", "marcus", "leo", "ethan", "grace"],
  },
  {
    key: "securityAudit",
    name: "Enterprise Security Audit",
    description:
      "Complete the annual enterprise readiness audit, covering access controls, data retention, vendor evidence, incident response drills, and customer-facing remediation notes.",
    status: "in-progress",
    priority: "critical",
    dueInDays: 30,
    budget: 64000,
    category: "Compliance",
    color: "indigo",
    ownerKey: "ava",
    memberKeys: ["ava", "marcus", "nina", "priya"],
  },
  {
    key: "websiteRefresh",
    name: "Public Website Refresh",
    description:
      "Refresh the public marketing site with updated positioning, stronger proof points, customer stories, product screenshots, and a faster content publishing workflow.",
    status: "completed",
    priority: "medium",
    dueInDays: -3,
    budget: 35000,
    category: "Marketing",
    color: "emerald",
    ownerKey: "sofia",
    memberKeys: ["ava", "sofia", "leo", "grace"],
  },
];

const taskSeeds = [
  {
    key: "portalJourneyMap",
    projectKey: "clientPortal",
    title: "Map the current client onboarding journey",
    description:
      "Document every step from invitation email through first project review, highlighting confusing handoffs, duplicate information requests, missing confirmations, and places where clients wait without context.",
    status: "done",
    priority: "high",
    dueInDays: -5,
    assigneeKey: "sofia",
    reporterKey: "marcus",
    tags: ["research", "onboarding", "client-portal"],
    order: 1,
    createdInDays: -22,
    updatedInDays: -5,
    subtasks: [
      { title: "Review support tickets from the last 90 days", completed: true },
      { title: "Interview three implementation managers", completed: true },
      { title: "Create journey map with friction severity labels", completed: true },
      { title: "Share synthesis with engineering and success leads", completed: true },
    ],
    comments: [
      {
        authorKey: "grace",
        content:
          "The biggest support theme is still uncertainty after invite acceptance. Clients want to know who owns the next step.",
        daysInPast: 9,
      },
      {
        authorKey: "sofia",
        content:
          "Journey map is linked in the project notes. I marked the account handoff and document upload steps as highest-friction moments.",
        daysInPast: 5,
      },
    ],
  },
  {
    key: "portalPermissions",
    projectKey: "clientPortal",
    title: "Define role-based permissions for external collaborators",
    description:
      "Specify what executives, client admins, contributors, and read-only observers can view or change across milestones, documents, comments, invoices, and project health summaries.",
    status: "in-progress",
    priority: "critical",
    dueInDays: 2,
    assigneeKey: "marcus",
    reporterKey: "ava",
    tags: ["permissions", "security", "collaboration"],
    order: 2,
    createdInDays: -18,
    updatedInDays: -1,
    subtasks: [
      { title: "Draft permission matrix for four external roles", completed: true },
      { title: "Review edge cases with security audit owner", completed: true },
      { title: "Confirm defaults for invited observers", completed: false },
      { title: "Publish acceptance criteria for engineering", completed: false },
    ],
    comments: [
      {
        authorKey: "ava",
        content:
          "Please keep the default external role conservative. It is easier to grant access than explain accidental visibility.",
        daysInPast: 3,
      },
      {
        authorKey: "marcus",
        content:
          "Matrix is mostly ready. I am waiting on the observer defaults before I mark the task ready for review.",
        daysInPast: 1,
      },
    ],
  },
  {
    key: "portalHealthWidgets",
    projectKey: "clientPortal",
    title: "Build project health summary widgets",
    description:
      "Implement the dashboard cards that summarize milestone confidence, open risks, overdue decisions, recent activity, and owner follow-up so clients can understand status without reading every task.",
    status: "review",
    priority: "high",
    dueInDays: 5,
    assigneeKey: "leo",
    reporterKey: "marcus",
    tags: ["frontend", "dashboard", "client-portal"],
    order: 3,
    createdInDays: -15,
    updatedInDays: -1,
    subtasks: [
      { title: "Create reusable health score component", completed: true },
      { title: "Connect summary widgets to project metrics endpoint", completed: true },
      { title: "Add loading and empty states for new clients", completed: true },
      { title: "Address copy review notes from Customer Success", completed: false },
    ],
    comments: [
      {
        authorKey: "leo",
        content:
          "The widgets are rendering against real project metrics now. Remaining work is mostly copy polish and responsive spacing.",
        daysInPast: 2,
      },
      {
        authorKey: "grace",
        content:
          "Please rename 'blocked decisions' to 'decisions needed' so it feels less severe for executive viewers.",
        daysInPast: 1,
      },
    ],
  },
  {
    key: "portalRegression",
    projectKey: "clientPortal",
    title: "Create regression checklist for client visibility changes",
    description:
      "Write a focused validation checklist that covers private notes, internal-only files, archived milestones, notification recipients, and role switching before the redesign ships.",
    status: "todo",
    priority: "critical",
    dueInDays: 7,
    assigneeKey: "priya",
    reporterKey: "ava",
    tags: ["qa", "privacy", "release-readiness"],
    order: 4,
    createdInDays: -7,
    updatedInDays: -2,
    subtasks: [
      { title: "List all visibility-sensitive entities", completed: true },
      { title: "Create test users for each external role", completed: false },
      { title: "Document expected notification recipients", completed: false },
      { title: "Add final checklist to release runbook", completed: false },
    ],
    comments: [
      {
        authorKey: "priya",
        content:
          "I found two older notification scenarios that are not covered by current automated tests. Adding them to the checklist.",
        daysInPast: 2,
      },
    ],
  },
  {
    key: "portalExecReadout",
    projectKey: "clientPortal",
    title: "Prepare executive readout for beta customers",
    description:
      "Create a concise beta briefing that explains what is changing, why it matters, how feedback will be collected, and what support path customers should use during the rollout.",
    status: "todo",
    priority: "medium",
    dueInDays: 11,
    assigneeKey: "grace",
    reporterKey: "marcus",
    tags: ["beta", "communications", "customer-success"],
    order: 5,
    createdInDays: -6,
    updatedInDays: -2,
    subtasks: [
      { title: "Draft beta customer announcement", completed: false },
      { title: "Create one-page change summary", completed: false },
      { title: "Confirm feedback intake owner", completed: false },
    ],
    comments: [
      {
        authorKey: "marcus",
        content:
          "Targeting the first beta cohort for next Thursday, assuming the permissions checklist clears review.",
        daysInPast: 2,
      },
    ],
  },
  {
    key: "mobileOfflineQueue",
    projectKey: "mobileRelease",
    title: "Stabilize offline task creation queue",
    description:
      "Ensure tasks created offline are queued locally, retried safely, deduplicated on reconnect, and surfaced to the user with clear sync status when connectivity changes.",
    status: "in-progress",
    priority: "critical",
    dueInDays: 1,
    assigneeKey: "leo",
    reporterKey: "nina",
    tags: ["mobile", "offline", "sync"],
    order: 1,
    createdInDays: -14,
    updatedInDays: 0,
    subtasks: [
      { title: "Persist queued task payloads with temporary client IDs", completed: true },
      { title: "Add reconnect retry with exponential backoff", completed: true },
      { title: "Prevent duplicate task creation after app restart", completed: false },
      { title: "Show sync state in task detail header", completed: false },
    ],
    comments: [
      {
        authorKey: "nina",
        content:
          "The duplicate prevention scenario is the release blocker. Please prioritize app restart plus reconnect testing.",
        daysInPast: 1,
      },
      {
        authorKey: "leo",
        content:
          "Retry logic is merged locally. I am adding an idempotency key before handing this to QA.",
        daysInPast: 0,
      },
    ],
  },
  {
    key: "mobilePushPreferences",
    projectKey: "mobileRelease",
    title: "Implement push notification preference screen",
    description:
      "Add settings that let users choose which task updates, project changes, comments, and deadline reminders generate push notifications on mobile.",
    status: "review",
    priority: "high",
    dueInDays: 4,
    assigneeKey: "sofia",
    reporterKey: "nina",
    tags: ["mobile", "notifications", "settings"],
    order: 2,
    createdInDays: -12,
    updatedInDays: -1,
    subtasks: [
      { title: "Design grouped preference controls", completed: true },
      { title: "Add copy for each notification category", completed: true },
      { title: "Validate accessibility labels on iOS and Android", completed: false },
    ],
    comments: [
      {
        authorKey: "sofia",
        content:
          "Design review is complete. I adjusted the labels to match the notification categories already used by the backend.",
        daysInPast: 1,
      },
    ],
  },
  {
    key: "mobileBoardPerf",
    projectKey: "mobileRelease",
    title: "Reduce task board load time on slow connections",
    description:
      "Profile the mobile board, trim redundant payload fields, add skeleton states, and make sure the first useful render happens quickly on high-latency connections.",
    status: "todo",
    priority: "high",
    dueInDays: 6,
    assigneeKey: "leo",
    reporterKey: "nina",
    tags: ["performance", "mobile", "board"],
    order: 3,
    createdInDays: -9,
    updatedInDays: -3,
    subtasks: [
      { title: "Capture baseline timings on throttled network", completed: true },
      { title: "Remove unused nested project fields from board response", completed: false },
      { title: "Add skeleton state for column loading", completed: false },
      { title: "Re-measure first useful render after payload changes", completed: false },
    ],
    comments: [
      {
        authorKey: "nina",
        content:
          "Baseline is roughly 3.8 seconds on simulated 3G. Goal is under 2.2 seconds before code freeze.",
        daysInPast: 3,
      },
    ],
  },
  {
    key: "mobileQaMatrix",
    projectKey: "mobileRelease",
    title: "Finalize release QA matrix",
    description:
      "Build the device and scenario matrix for release 2.4, including offline behavior, notification preferences, deep links, dark mode, and upgrade-from-previous-version checks.",
    status: "in-progress",
    priority: "medium",
    dueInDays: 3,
    assigneeKey: "priya",
    reporterKey: "nina",
    tags: ["qa", "release", "mobile"],
    order: 4,
    createdInDays: -11,
    updatedInDays: -1,
    subtasks: [
      { title: "List supported device and OS combinations", completed: true },
      { title: "Add regression scenarios from release 2.3 incidents", completed: true },
      { title: "Confirm beta tester coverage for Android tablets", completed: false },
      { title: "Publish final matrix in release checklist", completed: false },
    ],
    comments: [
      {
        authorKey: "priya",
        content:
          "The Android tablet gap is the only coverage concern. I asked support for two additional beta testers.",
        daysInPast: 1,
      },
    ],
  },
  {
    key: "mobileReleaseNotes",
    projectKey: "mobileRelease",
    title: "Draft release notes for app stores",
    description:
      "Prepare concise release notes that explain offline task capture, notification controls, performance improvements, and the most important bug fixes in plain customer language.",
    status: "todo",
    priority: "low",
    dueInDays: 9,
    assigneeKey: "grace",
    reporterKey: "nina",
    tags: ["release-notes", "mobile", "communications"],
    order: 5,
    createdInDays: -5,
    updatedInDays: -4,
    subtasks: [
      { title: "Collect final feature list from engineering", completed: false },
      { title: "Write customer-facing release notes", completed: false },
      { title: "Confirm screenshots for app store listing", completed: false },
    ],
    comments: [],
  },
  {
    key: "analyticsMetricDefinitions",
    projectKey: "analyticsHub",
    title: "Agree on revenue metric definitions",
    description:
      "Align leadership, sales, success, and delivery teams on the exact definitions for pipeline value, committed renewal, expansion opportunity, delivery margin, and risk-adjusted forecast.",
    status: "in-progress",
    priority: "critical",
    dueInDays: 8,
    assigneeKey: "ethan",
    reporterKey: "ava",
    tags: ["analytics", "metrics", "alignment"],
    order: 1,
    createdInDays: -10,
    updatedInDays: -1,
    subtasks: [
      { title: "Collect current definitions from each team", completed: true },
      { title: "Identify conflicting calculation rules", completed: true },
      { title: "Run definition review with leadership", completed: false },
      { title: "Publish metric glossary", completed: false },
    ],
    comments: [
      {
        authorKey: "ethan",
        content:
          "The largest mismatch is how expansion is counted before procurement approval. I added options for the leadership review.",
        daysInPast: 1,
      },
    ],
  },
  {
    key: "analyticsWarehouseModel",
    projectKey: "analyticsHub",
    title: "Model project margin tables in the warehouse",
    description:
      "Create warehouse tables that combine project budgets, booked hours, staffing mix, expenses, and task completion patterns so delivery margin can be tracked weekly.",
    status: "todo",
    priority: "high",
    dueInDays: 16,
    assigneeKey: "ethan",
    reporterKey: "nina",
    tags: ["warehouse", "margin", "data-model"],
    order: 2,
    createdInDays: -8,
    updatedInDays: -4,
    subtasks: [
      { title: "Review source tables for budget and time tracking", completed: false },
      { title: "Draft fact and dimension model", completed: false },
      { title: "Validate sample margin calculations with Finance", completed: false },
    ],
    comments: [
      {
        authorKey: "nina",
        content:
          "Please call out source systems that are missing project IDs. We may need a matching table before the model is trustworthy.",
        daysInPast: 4,
      },
    ],
  },
  {
    key: "analyticsDashboardWireframes",
    projectKey: "analyticsHub",
    title: "Create executive dashboard wireframes",
    description:
      "Design wireframes for a leadership dashboard showing revenue trend, forecast confidence, renewal risk, delivery margin, and the customer accounts needing immediate attention.",
    status: "todo",
    priority: "medium",
    dueInDays: 19,
    assigneeKey: "sofia",
    reporterKey: "ethan",
    tags: ["dashboard", "wireframes", "executive"],
    order: 3,
    createdInDays: -6,
    updatedInDays: -5,
    subtasks: [
      { title: "Collect leadership dashboard examples", completed: true },
      { title: "Sketch primary KPI layout", completed: false },
      { title: "Review scanability with Ava", completed: false },
    ],
    comments: [],
  },
  {
    key: "analyticsDataQuality",
    projectKey: "analyticsHub",
    title: "Set data quality checks for renewal risk inputs",
    description:
      "Create validation rules for renewal date, contract value, usage health, support volume, executive sponsor status, and open escalation fields before they feed the risk model.",
    status: "todo",
    priority: "high",
    dueInDays: 13,
    assigneeKey: "priya",
    reporterKey: "ethan",
    tags: ["data-quality", "renewals", "qa"],
    order: 4,
    createdInDays: -4,
    updatedInDays: -2,
    subtasks: [
      { title: "List required fields for renewal risk scoring", completed: true },
      { title: "Define invalid value thresholds", completed: false },
      { title: "Create reporting view for failed checks", completed: false },
      { title: "Confirm owner for weekly data cleanup", completed: false },
    ],
    comments: [
      {
        authorKey: "grace",
        content:
          "Success can own the sponsor status cleanup, but we need the failed-check report to include account owner and renewal date.",
        daysInPast: 2,
      },
    ],
  },
  {
    key: "supportClassifier",
    projectKey: "supportAutomation",
    title: "Validate support request classification rules",
    description:
      "Review the classification rules for billing, access, task workflow, integration, defect, and account health requests so the pilot routes tickets accurately before automation drafts responses.",
    status: "in-progress",
    priority: "high",
    dueInDays: -2,
    assigneeKey: "grace",
    reporterKey: "marcus",
    tags: ["support", "classification", "pilot"],
    order: 1,
    createdInDays: -16,
    updatedInDays: -2,
    subtasks: [
      { title: "Export recent support ticket sample", completed: true },
      { title: "Label 150 historical tickets by category", completed: true },
      { title: "Resolve billing versus account-health ambiguity", completed: false },
      { title: "Approve classifier thresholds for pilot", completed: false },
    ],
    comments: [
      {
        authorKey: "grace",
        content:
          "Blocked on the billing ambiguity. The current rule misroutes renewal billing questions as account health.",
        daysInPast: 2,
      },
      {
        authorKey: "ethan",
        content:
          "I can split the historical sample by contract stage. That should make the billing pattern clearer.",
        daysInPast: 2,
      },
    ],
  },
  {
    key: "supportDraftResponses",
    projectKey: "supportAutomation",
    title: "Write approved first-response templates",
    description:
      "Create human-reviewed response templates for common access issues, missed notifications, project invite confusion, export questions, and integration setup requests.",
    status: "todo",
    priority: "medium",
    dueInDays: 5,
    assigneeKey: "grace",
    reporterKey: "ava",
    tags: ["support", "templates", "customer-success"],
    order: 2,
    createdInDays: -8,
    updatedInDays: -4,
    subtasks: [
      { title: "Draft access issue response", completed: true },
      { title: "Draft notification troubleshooting response", completed: false },
      { title: "Draft integration setup response", completed: false },
      { title: "Review tone with Support leadership", completed: false },
    ],
    comments: [
      {
        authorKey: "ava",
        content:
          "Please keep the templates specific enough to be useful but clear that a person will review before sending.",
        daysInPast: 4,
      },
    ],
  },
  {
    key: "supportEscalationRules",
    projectKey: "supportAutomation",
    title: "Define escalation rules for high-risk accounts",
    description:
      "Set clear escalation rules for enterprise accounts, renewal-window customers, security-sensitive requests, repeated failed automation drafts, and tickets mentioning production deadlines.",
    status: "todo",
    priority: "critical",
    dueInDays: 6,
    assigneeKey: "marcus",
    reporterKey: "grace",
    tags: ["support", "escalation", "risk"],
    order: 3,
    createdInDays: -7,
    updatedInDays: -3,
    subtasks: [
      { title: "Collect escalation scenarios from Success", completed: true },
      { title: "Define high-risk account criteria", completed: false },
      { title: "Add escalation owner mapping", completed: false },
      { title: "Review with Delivery leadership", completed: false },
    ],
    comments: [],
  },
  {
    key: "supportPilotScorecard",
    projectKey: "supportAutomation",
    title: "Build pilot scorecard",
    description:
      "Define the measurement view for automation acceptance rate, saved handling time, customer satisfaction movement, escalation accuracy, and manual override reasons during the pilot.",
    status: "todo",
    priority: "medium",
    dueInDays: 12,
    assigneeKey: "ethan",
    reporterKey: "grace",
    tags: ["analytics", "support", "scorecard"],
    order: 4,
    createdInDays: -5,
    updatedInDays: -1,
    subtasks: [
      { title: "Confirm pilot success metrics", completed: true },
      { title: "Identify source fields for handling time", completed: false },
      { title: "Draft weekly scorecard layout", completed: false },
    ],
    comments: [
      {
        authorKey: "ethan",
        content:
          "I can produce the scorecard once the classification categories stop changing. Current mock has five metrics and override reasons.",
        daysInPast: 1,
      },
    ],
  },
  {
    key: "securityAccessReview",
    projectKey: "securityAudit",
    title: "Complete privileged access review",
    description:
      "Audit all admin, manager, database, deployment, and vendor accounts; confirm current owner, business need, last activity, MFA status, and removal plan for stale access.",
    status: "in-progress",
    priority: "critical",
    dueInDays: 4,
    assigneeKey: "priya",
    reporterKey: "ava",
    tags: ["security", "access-review", "compliance"],
    order: 1,
    createdInDays: -13,
    updatedInDays: -1,
    subtasks: [
      { title: "Export privileged account list", completed: true },
      { title: "Verify MFA status for every account", completed: true },
      { title: "Confirm business owner for vendor accounts", completed: false },
      { title: "Open removal tickets for stale access", completed: false },
    ],
    comments: [
      {
        authorKey: "priya",
        content:
          "Vendor owner confirmation is the only slow piece. I flagged eight accounts that need a business owner by Friday.",
        daysInPast: 1,
      },
    ],
  },
  {
    key: "securityRetentionPolicy",
    projectKey: "securityAudit",
    title: "Refresh data retention policy evidence",
    description:
      "Collect current retention policy evidence for customer exports, file attachments, audit logs, deleted projects, archived notifications, and support transcripts.",
    status: "review",
    priority: "high",
    dueInDays: 9,
    assigneeKey: "marcus",
    reporterKey: "ava",
    tags: ["security", "retention", "evidence"],
    order: 2,
    createdInDays: -12,
    updatedInDays: -2,
    subtasks: [
      { title: "Update retention matrix", completed: true },
      { title: "Collect storage lifecycle screenshots", completed: true },
      { title: "Review deleted-project handling with engineering", completed: true },
      { title: "Attach final evidence packet", completed: false },
    ],
    comments: [
      {
        authorKey: "marcus",
        content:
          "Evidence packet is ready for one last pass. I want engineering to confirm the archived notification behavior.",
        daysInPast: 2,
      },
    ],
  },
  {
    key: "securityIncidentDrill",
    projectKey: "securityAudit",
    title: "Run incident response tabletop drill",
    description:
      "Facilitate a tabletop exercise for suspicious account access, covering detection, communication, customer notice decisioning, evidence capture, and post-incident follow-up.",
    status: "todo",
    priority: "high",
    dueInDays: 18,
    assigneeKey: "nina",
    reporterKey: "ava",
    tags: ["security", "incident-response", "tabletop"],
    order: 3,
    createdInDays: -6,
    updatedInDays: -4,
    subtasks: [
      { title: "Write drill scenario and timeline", completed: false },
      { title: "Schedule required participants", completed: false },
      { title: "Prepare note-taking template", completed: false },
      { title: "Document follow-up actions after drill", completed: false },
    ],
    comments: [],
  },
  {
    key: "securityCustomerPacket",
    projectKey: "securityAudit",
    title: "Prepare customer-facing audit summary",
    description:
      "Write the customer-ready summary explaining audit scope, completed controls, remediation items, evidence availability, and how account teams should answer common security questions.",
    status: "todo",
    priority: "medium",
    dueInDays: 24,
    assigneeKey: "ava",
    reporterKey: "marcus",
    tags: ["security", "communications", "customers"],
    order: 4,
    createdInDays: -4,
    updatedInDays: -3,
    subtasks: [
      { title: "Draft plain-language audit overview", completed: false },
      { title: "List controls completed this quarter", completed: false },
      { title: "Review remediation wording with Legal", completed: false },
    ],
    comments: [
      {
        authorKey: "marcus",
        content:
          "Sales needs a version that is clear without over-sharing internal control details. We can keep the evidence packet separate.",
        daysInPast: 3,
      },
    ],
  },
  {
    key: "websiteMessaging",
    projectKey: "websiteRefresh",
    title: "Publish updated homepage messaging",
    description:
      "Replace the old homepage copy with sharper positioning around real-time project visibility, delivery confidence, customer collaboration, and executive-ready reporting.",
    status: "done",
    priority: "high",
    dueInDays: -8,
    assigneeKey: "sofia",
    reporterKey: "ava",
    tags: ["website", "copy", "positioning"],
    order: 1,
    createdInDays: -28,
    updatedInDays: -6,
    subtasks: [
      { title: "Draft homepage headline and supporting copy", completed: true },
      { title: "Review messaging with leadership", completed: true },
      { title: "Publish final copy to CMS", completed: true },
    ],
    comments: [
      {
        authorKey: "ava",
        content:
          "The new messaging is much clearer. Please reuse the delivery confidence language in the sales deck update.",
        daysInPast: 6,
      },
    ],
  },
  {
    key: "websiteCaseStudies",
    projectKey: "websiteRefresh",
    title: "Launch customer story page",
    description:
      "Create a customer story page that explains the customer challenge, implementation timeline, measurable results, team quotes, and product capabilities used.",
    status: "done",
    priority: "medium",
    dueInDays: -5,
    assigneeKey: "grace",
    reporterKey: "sofia",
    tags: ["website", "case-study", "proof"],
    order: 2,
    createdInDays: -24,
    updatedInDays: -4,
    subtasks: [
      { title: "Approve customer quote", completed: true },
      { title: "Create results callout section", completed: true },
      { title: "Publish page and add navigation link", completed: true },
    ],
    comments: [
      {
        authorKey: "grace",
        content:
          "Customer approved the quote and logo usage. Page is live and linked from the homepage proof section.",
        daysInPast: 4,
      },
    ],
  },
  {
    key: "websiteScreenshots",
    projectKey: "websiteRefresh",
    title: "Update product screenshots",
    description:
      "Refresh marketing screenshots to show the current dashboard, project cards, task board, calendar, and notification views with realistic sample data.",
    status: "done",
    priority: "medium",
    dueInDays: -4,
    assigneeKey: "leo",
    reporterKey: "sofia",
    tags: ["website", "screenshots", "product"],
    order: 3,
    createdInDays: -18,
    updatedInDays: -3,
    subtasks: [
      { title: "Capture dashboard and project views", completed: true },
      { title: "Mask internal customer names", completed: true },
      { title: "Optimize screenshots for page speed", completed: true },
    ],
    comments: [],
  },
  {
    key: "websiteRedirects",
    projectKey: "websiteRefresh",
    title: "Verify launch redirects and analytics events",
    description:
      "Confirm old landing page URLs redirect correctly and that analytics events fire for pricing clicks, demo requests, customer story views, and newsletter signups.",
    status: "done",
    priority: "high",
    dueInDays: -2,
    assigneeKey: "priya",
    reporterKey: "sofia",
    tags: ["website", "analytics", "launch"],
    order: 4,
    createdInDays: -12,
    updatedInDays: -1,
    subtasks: [
      { title: "Test top 25 legacy URLs", completed: true },
      { title: "Validate analytics events in staging", completed: true },
      { title: "Confirm production events after launch", completed: true },
    ],
    comments: [
      {
        authorKey: "priya",
        content:
          "All priority redirects passed. Production analytics events are firing with the expected names.",
        daysInPast: 1,
      },
    ],
  },
];

const notificationSeeds = [
  {
    userKey: "ava",
    type: "deadline",
    title: "Critical client portal task due soon",
    message: "Define role-based permissions for external collaborators is due in two days.",
    linkTaskKey: "portalPermissions",
    read: false,
    createdInDays: -1,
  },
  {
    userKey: "marcus",
    type: "project",
    title: "Support automation is blocked",
    message: "Classification rule ambiguity is holding up the Support Automation Pilot.",
    linkProjectKey: "supportAutomation",
    read: false,
    createdInDays: -2,
  },
  {
    userKey: "nina",
    type: "task",
    title: "Offline queue needs release attention",
    message: "Stabilize offline task creation queue still has duplicate prevention work open.",
    linkTaskKey: "mobileOfflineQueue",
    read: false,
    createdInDays: 0,
  },
  {
    userKey: "sofia",
    type: "comment",
    title: "Copy feedback on health widgets",
    message: "Grace requested a friendlier label for the client portal health widgets.",
    linkTaskKey: "portalHealthWidgets",
    read: false,
    createdInDays: -1,
  },
  {
    userKey: "leo",
    type: "deadline",
    title: "Mobile sync deadline approaching",
    message: "The offline task creation queue is due tomorrow and remains release-critical.",
    linkTaskKey: "mobileOfflineQueue",
    read: false,
    createdInDays: 0,
  },
  {
    userKey: "priya",
    type: "task",
    title: "Access review follow-up",
    message: "Eight vendor accounts still need a confirmed business owner before the audit checkpoint.",
    linkTaskKey: "securityAccessReview",
    read: false,
    createdInDays: -1,
  },
  {
    userKey: "ethan",
    type: "comment",
    title: "Support scorecard dependency",
    message: "Grace needs the classifier categories stabilized before pilot scorecard work can finish.",
    linkTaskKey: "supportPilotScorecard",
    read: true,
    createdInDays: -1,
  },
  {
    userKey: "grace",
    type: "project",
    title: "Beta communication draft needed",
    message: "The client portal beta readout is scheduled before the first customer cohort starts.",
    linkTaskKey: "portalExecReadout",
    read: false,
    createdInDays: -2,
  },
  {
    userKey: "ava",
    type: "system",
    title: "Demo workspace seeded",
    message: "Detailed projects, tasks, comments, notifications, and activity history are ready for review.",
    linkProjectKey: "clientPortal",
    read: true,
    createdInDays: -6,
  },
];

const activitySeeds = [
  {
    actorKey: "leo",
    type: "task",
    message: "Leo Martinez updated offline queue retry logic for Mobile Release 2.4.",
    projectKey: "mobileRelease",
    taskKey: "mobileOfflineQueue",
    createdInDays: 0,
  },
  {
    actorKey: "nina",
    type: "comment",
    message: "Nina Okafor flagged duplicate prevention as the mobile release blocker.",
    projectKey: "mobileRelease",
    taskKey: "mobileOfflineQueue",
    createdInDays: -1,
  },
  {
    actorKey: "priya",
    type: "task",
    message: "Priya Shah confirmed production analytics events for the website refresh.",
    projectKey: "websiteRefresh",
    taskKey: "websiteRedirects",
    createdInDays: -1,
  },
  {
    actorKey: "marcus",
    type: "project",
    message: "Marcus Reed updated the client portal permissions matrix.",
    projectKey: "clientPortal",
    taskKey: "portalPermissions",
    createdInDays: -1,
  },
  {
    actorKey: "grace",
    type: "comment",
    message: "Grace Kim requested friendlier wording for project health labels.",
    projectKey: "clientPortal",
    taskKey: "portalHealthWidgets",
    createdInDays: -1,
  },
  {
    actorKey: "ethan",
    type: "task",
    message: "Ethan Brooks documented conflicting expansion revenue definitions.",
    projectKey: "analyticsHub",
    taskKey: "analyticsMetricDefinitions",
    createdInDays: -1,
  },
  {
    actorKey: "priya",
    type: "task",
    message: "Priya Shah opened the vendor owner follow-up list for the security audit.",
    projectKey: "securityAudit",
    taskKey: "securityAccessReview",
    createdInDays: -1,
  },
  {
    actorKey: "grace",
    type: "project",
    message: "Grace Kim marked support classification as blocked pending billing rule clarification.",
    projectKey: "supportAutomation",
    taskKey: "supportClassifier",
    createdInDays: -2,
  },
  {
    actorKey: "sofia",
    type: "task",
    message: "Sofia Chen completed the client onboarding journey map.",
    projectKey: "clientPortal",
    taskKey: "portalJourneyMap",
    createdInDays: -5,
  },
  {
    actorKey: "ava",
    type: "system",
    message: "Ava Patel created the seeded TaskFlow demo workspace.",
    projectKey: "clientPortal",
    createdInDays: -6,
  },
];

const clearDatabase = async () => {
  await Promise.all([
    Activity.deleteMany({}),
    Notification.deleteMany({}),
    Task.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({}),
  ]);
};

const indexByKey = (documents, seeds) =>
  seeds.reduce((accumulator, seed, index) => {
    accumulator[seed.key] = documents[index];
    return accumulator;
  }, {});

const importData = async () => {
  await clearDatabase();

  const createdUsers = await User.create(
    users.map(({ key: _key, ...user }) => user)
  );
  const userByKey = indexByKey(createdUsers, users);

  const createdProjects = await Project.insertMany(
    projectSeeds.map(({ key: _key, ownerKey, memberKeys, dueInDays, ...project }) => ({
      ...project,
      owner: userByKey[ownerKey]._id,
      members: memberKeys.map((memberKey) => userByKey[memberKey]._id),
      dueDate: relativeDate(dueInDays),
      createdAt: relativeDate(-30, 9),
      updatedAt: relativeDate(-1, 14),
    }))
  );
  const projectByKey = indexByKey(createdProjects, projectSeeds);

  const createdTasks = await Task.insertMany(
    taskSeeds.map(
      ({
        key: _key,
        projectKey,
        assigneeKey,
        reporterKey,
        dueInDays,
        createdInDays,
        updatedInDays,
        comments = [],
        ...task
      }) => {
        const taskCreatedAt = relativeDate(createdInDays, 9);
        const taskUpdatedAt = relativeDate(updatedInDays, 16);

        return {
          ...task,
          project: projectByKey[projectKey]._id,
          assignee: userByKey[assigneeKey]._id,
          reporter: userByKey[reporterKey]._id,
          dueDate: relativeDate(dueInDays),
          comments: comments.map(({ authorKey, daysInPast, ...comment }, index) => {
            const commentDate = relativeDate(-daysInPast, 10 + index);
            return {
              ...comment,
              author: userByKey[authorKey]._id,
              createdAt: commentDate,
              updatedAt: commentDate,
            };
          }),
          createdAt: taskCreatedAt,
          updatedAt: taskUpdatedAt,
        };
      }
    )
  );
  const taskByKey = indexByKey(createdTasks, taskSeeds);

  await Notification.insertMany(
    notificationSeeds.map(
      ({ userKey, linkTaskKey, linkProjectKey, createdInDays, ...notification }) => {
        const createdAt = relativeDate(createdInDays, 11);
        const link = linkTaskKey
          ? `/tasks/${taskByKey[linkTaskKey]._id}`
          : `/projects/${projectByKey[linkProjectKey]._id}`;

        return {
          ...notification,
          user: userByKey[userKey]._id,
          link,
          createdAt,
          updatedAt: createdAt,
        };
      }
    )
  );

  await Activity.insertMany(
    activitySeeds.map(({ actorKey, projectKey, taskKey, createdInDays, ...activity }) => {
      const createdAt = relativeDate(createdInDays, 15);

      return {
        ...activity,
        actor: userByKey[actorKey]._id,
        project: projectByKey[projectKey]._id,
        task: taskKey ? taskByKey[taskKey]._id : null,
        createdAt,
        updatedAt: createdAt,
      };
    })
  );

  console.log("Seed data imported successfully.");
  console.log("Demo login: ava.patel@taskflow.demo / password123");
  console.log(`Created ${createdUsers.length} users, ${createdProjects.length} projects, and ${createdTasks.length} tasks.`);
};

const destroyData = async () => {
  await clearDatabase();
  console.log("Seeded collections cleared successfully.");
};

const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

const run = async () => {
  try {
    await connectDatabase();

    if (process.argv.includes("--destroy")) {
      await destroyData();
    } else {
      await importData();
    }

    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error(`Seed script failed: ${error.message}`);
    await closeConnection();
    process.exit(1);
  }
};

run();

# Rule: Layout – Allocations Data Table (React + Tailwind + shadcn/ui)

## Goal
Implement a responsive allocations data table that displays resource allocation across weekly time periods. Use:
- React + TypeScript
- Tailwind CSS classes
- shadcn/ui table primitives where practical (Table, TableHeader, TableRow, TableHead, TableBody, TableCell)
- Accessibility: semantic table markup, header associations, keyboard focus.
- Horizontal scrolling for weekly columns with lazy loading

## Layout Requirements
1) **Header Row (Primary)**
   - Column order and titles:
     1. "Resource Name" (linked to resource profile)
     2. "Grade" 
     3. "Skill Function"
     4. "Skill Sub-Function"
     5. Weekly columns: "1-Sep", "8-Sep", "15-Sep", etc. (Monday of each week)
   - Header row is sticky on scroll (sticky top-0, backdrop + border).
   - Weekly columns are horizontally scrollable.

2) **Time Window Display**
   - **Initial view**: Past 4 weeks + current week + next 24 weeks (29 weeks total)
   - **Anchor point**: Current week (centered in view)
   - **Week format**: "D-MMM" (e.g., "1-Sep", "8-Sep", "15-Sep")
   - **Reference**: Monday of each week
   - **Lazy loading**: Weeks outside current view are loaded on demand

3) **Row Data Rules**
   - **Resource columns**:
     - Resource Name: Clickable link to resource profile page
     - Grade: Read-only display (e.g., "Senior", "Lead", "Principal")
     - Skill Function: Read-only display (e.g., "Engineering", "Design", "Product")
     - Skill Sub-Function: Read-only display (e.g., "Frontend", "Backend", "DevOps")
   - **Weekly allocation columns**:
     - Display person days allocated (e.g., "2", "4.5", "0")
     - Show project name alongside person days in clean, non-cluttered format
     - Empty cells show "0" or "-" for no allocation
     - Color coding for different allocation levels (optional)

4) **Scrolling & Navigation**
   - Horizontal scrolling for weekly columns
   - Fixed resource information columns (first 4 columns) remain visible during scroll
   - Smooth scrolling with scroll indicators
   - No time period jumping - only scroll-based navigation

5) **Empty/Loading/Errors**
   - Loading skeleton for resource rows
   - Empty state when no resources available
   - Loading indicators for lazy-loaded weeks
   - Error handling for failed allocation data

6) **Interactivity**
   - Resource name click navigates to profile page
   - Weekly cells may be editable for allocation updates (future enhancement)
   - Hover effects for better UX
   - Responsive design for different screen sizes

## API / Types
```ts
export type ResourceGrade = "Junior" | "Mid" | "Senior" | "Lead" | "Principal";
export type SkillFunction = "Engineering" | "Design" | "Product" | "QA" | "DevOps";
export type SkillSubFunction = "Frontend" | "Backend" | "Full-Stack" | "Mobile" | "Data" | "Infrastructure";

export interface WeeklyAllocation {
  weekStart: string; // YYYY-MM-DD (Monday)
  personDays: number;
  projectName?: string;
  projectId?: string;
}

export interface Resource {
  id: string;
  name: string;
  grade: ResourceGrade;
  skillFunction: SkillFunction;
  skillSubFunction: SkillSubFunction;
  profileUrl: string;
  weeklyAllocations: WeeklyAllocation[];
}

export interface AllocationsTableProps {
  resources: Resource[];
  currentWeekStart: string; // YYYY-MM-DD (Monday of current week)
  onResourceClick?: (resourceId: string) => void;
  onAllocationUpdate?: (resourceId: string, weekStart: string, personDays: number) => void;
}
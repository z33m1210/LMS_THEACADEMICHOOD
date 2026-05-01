# Feature Testing Guide: Editable Module Path & Lively Rendering
**Project**: The Academic Hood LMS  
**Target Flow**: Teacher Curriculum Management

This guide outlines the steps to verify the high-fidelity Duolingo-style path and the new document rendering engine.

---

## 1. Accessing the Workspace
1.  **Login** as a Teacher or Admin.
2.  Navigate to **Batches** and select a specific batch (e.g., `THE-HOOD-2024`).
3.  In the curriculum grid, click on a **Module (Section)** title.
4.  You should now see the **Vertical Path Workspace**.

## 2. Verifying the Duolingo Path Layout
*   [ ] **Geometry Check**: Ensure there is a centered vertical gray line connecting all activities within a lesson.
*   [ ] **Node Shapes**: Confirm activities are rendered as **Capsules** (pill-shaped) with icons on the left and management buttons on the right.
*   [ ] **Ghost Nodes**: Verify that a small `(+)` button appears above, between, and below every activity node.

## 3. Testing Content Insertion (The "Plus" Flow)
1.  Hover over a **Ghost Node `(+)`** and click it.
2.  A **Glassmorphism Type Picker** should appear.
3.  Select a type (e.g., **Page**).
4.  **Success Criteria**: A new capsule should be inserted at that position, and the **Side Editor Panel** should open immediately so you can begin editing the title and source.

## 4. Testing the Lively Rendering Engine (File-First)
1.  Click on any **Activity Capsule** to open the Side Editor Panel.
2.  **Upload Test**: Drag and drop a `.docx` or `.pdf` file into the "Document Source" zone.
3.  **Live Preview**:
    *   **DOCX**: The content of the Word document should render as formatted HTML inside the editor panel.
    *   **PDF**: A PDF viewer should embed the document within the panel.
4.  **Success Criteria**: The preview should update immediately without a full page refresh.

## 5. Verifying Management Controls
*   [ ] **Visibility Toggle**: Click the "Eye" icon. The node should dim to 40% opacity.
*   [ ] **Delete Functionality**: Click the "Trash" icon. The **Champ Conversation Flow** should appear in the **center of the screen**. It should have a focused card layout (max-width 550px) and features the official Champ image. Verify that Champ's bubble and Response Chips are perfectly aligned.
*   [ ] **Modified Glow**: After editing an activity, ensure the capsule border glows **Electric Blue** (indicating a Batch Override is active).
*   * [ ] **Pulse Animation**: Ensure the node you are currently editing is **pulsing** (Duolingo-style active feedback).

## 6. Mascot & Feedback
1.  Make a change to an activity (e.g., rename it).
2.  Wait for the **"Saved"** indicator to appear.
3.  **Success Criteria**: The **Champ Mascot** should trigger a celebration toast/message acknowledging your update.

---
**Need Help?** If the path looks misaligned or the preview fails, check the browser console for SCSS compilation errors or API 500 responses.

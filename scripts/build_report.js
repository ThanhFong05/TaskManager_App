const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} = require('docx');

// Create Document
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch
            bottom: 1440,
            left: 1440,
            right: 1440,
          },
        },
      },
      children: [
        // Title
        new Paragraph({
          text: "PRACTICAL EXAM 2: TASK MANAGEMENT APP (TaFo)",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 },
          children: [
            new TextRun({
              text: "Authentication, Teams Collaboration & Real-Time Chat",
              italics: true,
              size: 24,
              color: "FF6B35",
              bold: true,
            }),
          ],
        }),

        // Student Info Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: "F3E8DC" },
                  children: [new Paragraph({ children: [new TextRun({ text: "Student Name:", bold: true })] })],
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ text: "[Điền Họ và Tên của bạn tại đây]" })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: "F3E8DC" },
                  children: [new Paragraph({ children: [new TextRun({ text: "Student ID:", bold: true })] })],
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ text: "[Điền Mã số sinh viên của bạn tại đây - VD: QE170000]" })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: "F3E8DC" },
                  children: [new Paragraph({ children: [new TextRun({ text: "GitHub Repository:", bold: true })] })],
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ text: "https://github.com/ThanhFong05/TaskManager_App.git" })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: "F3E8DC" },
                  children: [new Paragraph({ children: [new TextRun({ text: "Expo / APK Link:", bold: true })] })],
                }),
                new TableCell({
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  children: [new Paragraph({ text: "[Dán Link Expo Publish hoặc QR Code / Link tải APK tại đây]" })],
                }),
              ],
            }),
          ],
        }),

        new Paragraph({ text: "", spacing: { after: 240 } }),

        // 1. OVERVIEW & TECH STACK
        new Paragraph({
          text: "1. Project Overview & Architecture",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "TaFo is a modern mobile task management application extending Practical Exam 1 by introducing secure Firebase Authentication, comprehensive Team Collaboration with short code joining, task delegation to assignees, and a real-time team chatroom powered by Cloud Firestore.",
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "• Frontend: ", bold: true }),
            new TextRun({ text: "React Native (Expo SDK 57), TypeScript, React Native Paper (Custom Warm Orange & Cream Beige Theme)." }),
          ],
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "• Backend: ", bold: true }),
            new TextRun({ text: "Firebase Authentication (Email/Password), Cloud Firestore (Real-time NoSQL Database)." }),
          ],
        }),
        new Paragraph({
          spacing: { after: 240 },
          children: [
            new TextRun({ text: "• State Management & Navigation: ", bold: true }),
            new TextRun({ text: "React Context API (AuthContext) with session persistence, React Navigation (Auth Stack vs App Tabs & Stack)." }),
          ],
        }),

        // 1.2 DATABASE ARCHITECTURE & ERD
        new Paragraph({
          text: "1.2 Database Architecture & Entity Relationship Diagram (ERD)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 120 },
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "The backend is architected on Cloud Firestore (NoSQL Document Store). The schema balances relational integrity with document denormalization to deliver instant queries without composite indexing bottlenecks:",
            }),
          ],
        }),

        // Database Schema Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ shading: { fill: "FFEAD9" }, children: [new Paragraph({ children: [new TextRun({ text: "Collection", bold: true })] })] }),
                new TableCell({ shading: { fill: "FFEAD9" }, children: [new Paragraph({ children: [new TextRun({ text: "Document ID", bold: true })] })] }),
                new TableCell({ shading: { fill: "FFEAD9" }, children: [new Paragraph({ children: [new TextRun({ text: "Key Fields & Types", bold: true })] })] }),
                new TableCell({ shading: { fill: "FFEAD9" }, children: [new Paragraph({ children: [new TextRun({ text: "Role & Description", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "users", children: [new TextRun({ text: " (Root)", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: "uid (Firebase Auth)" })] }),
                new TableCell({ children: [new Paragraph({ text: "id: string\nname: string\nemail: string\navatarUrl: string | null\ncreatedAt: number" })] }),
                new TableCell({ children: [new Paragraph({ text: "Stores user profiles linked 1:1 with Firebase Authentication accounts." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "teams", children: [new TextRun({ text: " (Root)", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Auto-generated" })] }),
                new TableCell({ children: [new Paragraph({ text: "id: string\ncode: string (e.g. TF-XXXX)\nname: string\ndescription: string\nownerId: string (FK)\ncreatedAt: number" })] }),
                new TableCell({ children: [new Paragraph({ text: "Defines team spaces with short 6-char joining codes and owner tracking." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "teamMembers", children: [new TextRun({ text: " (Root)", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: "{teamId}_{userId}" })] }),
                new TableCell({ children: [new Paragraph({ text: "id: string\nteamId: string (FK)\nuserId: string (FK)\nuserName: string\nuserEmail: string\nrole: 'owner' | 'member'\njoinedAt: number" })] }),
                new TableCell({ children: [new Paragraph({ text: "Resolves the Many-to-Many (N:N) relationship between Users and Teams." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "tasks", children: [new TextRun({ text: " (Root)", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Auto-generated" })] }),
                new TableCell({ children: [new Paragraph({ text: "id: string\ntitle: string\ndescription: string\nstatus: TaskStatus\npriority: TaskPriority\ndueDate: string (ISO)\ncreatedAt: number\ncreatorId: string (FK)\nteamId: string | null (FK)\nteamName: string | null\nassigneeId: string | null (FK)\nassigneeName: string | null" })] }),
                new TableCell({ children: [new Paragraph({ text: "Stores tasks. Supports personal tasks (creatorId) and team tasks with member assignee." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "messages", children: [new TextRun({ text: " (Subcollection)\nteams/{teamId}/messages", bold: true, size: 18 })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Auto-generated" })] }),
                new TableCell({ children: [new Paragraph({ text: "id: string\nsenderId: string (FK)\nsenderName: string\ntext: string\ncreatedAt: number" })] }),
                new TableCell({ children: [new Paragraph({ text: "Per-team real-time chat messages ordered chronologically via onSnapshot." })] }),
              ],
            }),
          ],
        }),

        new Paragraph({ text: "", spacing: { after: 120 } }),

        // Relationship descriptions
        new Paragraph({
          text: "Entity Relationships (ERD Cardinality):",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 120, after: 80 },
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "1. Users <-> Teams (Many-to-Many via teamMembers): ", bold: true }),
            new TextRun({ text: "A user can create or join multiple teams. A team has many members with roles (Owner / Member)." }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "2. Teams -> Tasks (One-to-Many): ", bold: true }),
            new TextRun({ text: "A team contains multiple tasks. Each team task belongs to exactly one team." }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "3. Users -> Tasks (One-to-Many for Assignee & Creator): ", bold: true }),
            new TextRun({ text: "A team member can be assigned multiple tasks (assigneeId). A user owns their personal tasks (creatorId)." }),
          ],
        }),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({ text: "4. Teams -> Messages (One-to-Many subcollection): ", bold: true }),
            new TextRun({ text: "Each team manages an independent chat stream under teams/{teamId}/messages." }),
          ],
        }),

        // 2. FIREBASE EVIDENCE
        new Paragraph({
          text: "2. Firebase Console Evidence",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),

        // 2.1 Auth Console
        new Paragraph({
          text: "2.1 Firebase Authentication Console",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP FIREBASE AUTHENTICATION CONSOLE TẠI ĐÂY\n(Phải hiển thị ít nhất 2 tài khoản test đã đăng ký: ví dụ user1@test.com và user2@test.com)"),
        new Paragraph({
          spacing: { before: 80, after: 200 },
          children: [
            new TextRun({ text: "Figure 1: ", bold: true }),
            new TextRun({ text: "Firebase Authentication console showing registered test user accounts with Email/Password provider enabled (Requirement 1)." }),
          ],
        }),

        // 2.2 Firestore Database
        new Paragraph({
          text: "2.2 Cloud Firestore Database Collections",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP CLOUD FIRESTORE CONSOLE TẠI ĐÂY\n(Hiển thị các collections: users, teams, teamMembers, tasks, và subcollection messages với dữ liệu mẫu)"),
        new Paragraph({
          spacing: { before: 80, after: 200 },
          children: [
            new TextRun({ text: "Figure 2: ", bold: true }),
            new TextRun({ text: "Cloud Firestore data structure demonstrating users, teams, teamMembers, tasks collections and teams/{teamId}/messages subcollection (Requirements 1, 2, 3, 4)." }),
          ],
        }),

        // 2.3 Security Rules
        new Paragraph({
          text: "2.3 Firestore Security Rules",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP FIRESTORE SECURITY RULES TẠI ĐÂY\n(Hiển thị các rules đã Publish yêu cầu request.auth != null để đọc/ghi)"),
        new Paragraph({
          spacing: { before: 80, after: 240 },
          children: [
            new TextRun({ text: "Figure 3: ", bold: true }),
            new TextRun({ text: "Firestore Security Rules configured in Firebase console enforcing authenticated access (request.auth != null) across all database collections (Requirement 5)." }),
          ],
        }),

        // 3. AUTHENTICATION SCREENS
        new Paragraph({
          text: "3. User Authentication Screens",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),

        // 3.1 Sign Up
        new Paragraph({
          text: "3.1 Sign Up Screen & Form Validation",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP MÀN HÌNH ĐĂNG KÝ (SIGN UP SCREEN) TẠI ĐÂY\n(Hiển thị các trường Full Name, Email, Password, Confirm Password, và nút ẩn/hiện mật khẩu độc lập hoặc thông báo lỗi kiểm tra hợp lệ)"),
        new Paragraph({
          spacing: { before: 80, after: 200 },
          children: [
            new TextRun({ text: "Figure 4: ", bold: true }),
            new TextRun({ text: "Sign Up screen in TaFo application demonstrating full input validation, independent password visibility toggles, and user document generation in Firestore (Requirement 1)." }),
          ],
        }),

        // 3.2 Login Screen
        new Paragraph({
          text: "3.2 Login Screen & Error Handling",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP MÀN HÌNH ĐĂNG NHẬP (LOGIN SCREEN) TẠI ĐÂY\n(Hiển thị giao diện đăng nhập với Email, Password, nút Sign In màu cam, và thông báo lỗi khi nhập sai mật khẩu)"),
        new Paragraph({
          spacing: { before: 80, after: 200 },
          children: [
            new TextRun({ text: "Figure 5: ", bold: true }),
            new TextRun({ text: "Login screen displaying warm orange & beige branding, input validation, and clear error messaging upon authentication failures (Requirement 1)." }),
          ],
        }),

        // 3.3 Profile & Logout
        new Paragraph({
          text: "3.3 Profile Screen & Logout Flow",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP MÀN HÌNH PROFILE & DIALOG XÁC NHẬN LOGOUT TẠI ĐÂY\n(Hiển thị Avatar, Tên người dùng, Email, Ngày tạo tài khoản, và Dialog xác nhận Log Out)"),
        new Paragraph({
          spacing: { before: 80, after: 240 },
          children: [
            new TextRun({ text: "Figure 6: ", bold: true }),
            new TextRun({ text: "Profile screen showing authenticated user information and confirmation dialog for logging out, which safely terminates the session and redirects to Login (Requirement 1)." }),
          ],
        }),

        // 4. TEAMS COLLABORATION
        new Paragraph({
          text: "4. Teams Collaboration & Team Details",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),

        // 4.1 Teams Screen
        new Paragraph({
          text: "4.1 Teams Screen (Create Team & Short Code Join)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP MÀN HÌNH TEAMS TẠI ĐÂY\n(Hiển thị danh sách nhóm đã tham gia với thẻ Team Code ngắn dạng TF-XXXX, nút Tạo Nhóm mới, hoặc Dialog nhập mã code tham gia)"),
        new Paragraph({
          spacing: { before: 80, after: 200 },
          children: [
            new TextRun({ text: "Figure 7: ", bold: true }),
            new TextRun({ text: "Teams screen showcasing created teams, short team codes for easy sharing, and options to create a team or join via team code (Requirement 2)." }),
          ],
        }),

        // 4.2 Team Detail Screen
        new Paragraph({
          text: "4.2 Team Detail Screen (Members List & Tasks Board)",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP MÀN HÌNH TEAM DETAIL TẠI ĐÂY\n(Hiển thị tab Members với danh sách thành viên gồm Tên, Email, Avatar, Vai trò Owner/Member; và nút Open Team Real-Time Chat)"),
        new Paragraph({
          spacing: { before: 80, after: 240 },
          children: [
            new TextRun({ text: "Figure 8: ", bold: true }),
            new TextRun({ text: "Team Detail screen displaying team overview, member list with roles (Owner/Member), and direct access to team tasks and chat (Requirement 2)." }),
          ],
        }),

        // 5. TASKS LINKED TO TEAMS & ASSIGNEES
        new Paragraph({
          text: "5. Tasks Linked to Teams and Assignees",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),

        // 5.1 Task Form
        new Paragraph({
          text: "5.1 Task Creation/Edit Form with Team & Member Selection",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP FORM TẠO/SỬA TASK TẠI ĐÂY\n(Hiển thị phần chọn Team và danh sách chip thành viên trong team để chọn Assignee)"),
        new Paragraph({
          spacing: { before: 80, after: 200 },
          children: [
            new TextRun({ text: "Figure 9: ", bold: true }),
            new TextRun({ text: "Task creation modal with dynamic team selector and team member picker to assign the task to a specific teammate (Requirement 3)." }),
          ],
        }),

        // 5.2 Home Screen & Task Item
        new Paragraph({
          text: "5.2 Home Screen & Task Cards Displaying Assignee Name",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 120, after: 80 },
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP MÀN HÌNH HOME VỚI CÁC THẺ TASK TẠI ĐÂY\n(Hiển thị thẻ Task có huy hiệu tên Team và huy hiệu 'Assignee: [Tên thành viên]', kèm bộ lọc theo Team và Status)"),
        new Paragraph({
          spacing: { before: 80, after: 240 },
          children: [
            new TextRun({ text: "Figure 10: ", bold: true }),
            new TextRun({ text: "Home screen showing team-aware filtered task list with clear assignee indicators, team badges, and status chips (Requirement 3)." }),
          ],
        }),

        // 6. REAL-TIME TEAM CHAT
        new Paragraph({
          text: "6. Real-Time Team Chat",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: "The chat room connects all team members in real time using Firestore onSnapshot listeners. Messages are visually distinguished between the current user (warm orange bubble, aligned right) and teammates (cream beige bubble, sender name, aligned left), with accurate timestamps.",
            }),
          ],
        }),
        createPlaceholderBox("DÁN ẢNH CHỤP MÀN HÌNH CHAT GIỮA 2 TÀI KHOẢN TẠI ĐÂY\n(Hiển thị cuộc hội thoại ngắn qua lại giữa User 1 và User 2 trong cùng 1 Team, thấy rõ bong bóng 2 màu, tên người gửi và mốc thời gian timestamp)"),
        new Paragraph({
          spacing: { before: 80, after: 240 },
          children: [
            new TextRun({ text: "Figure 11: ", bold: true }),
            new TextRun({ text: "Real-time team chat screen demonstrating a conversation between two distinct test accounts (User 1 and User 2) with visible sender names, styled bubbles, and timestamps (Requirement 4)." }),
          ],
        }),

        // 7. SUMMARY
        new Paragraph({
          text: "7. Conclusion & Requirement Compliance",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ shading: { fill: "FFEAD9" }, children: [new Paragraph({ children: [new TextRun({ text: "Requirement", bold: true })] })] }),
                new TableCell({ shading: { fill: "FFEAD9" }, children: [new Paragraph({ children: [new TextRun({ text: "Implementation Status", bold: true })] })] }),
                new TableCell({ shading: { fill: "FFEAD9" }, children: [new Paragraph({ children: [new TextRun({ text: "Details", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "1. Firebase Authentication" })] }),
                new TableCell({ children: [new Paragraph({ text: "Completed (100%)", children: [new TextRun({ text: " [PASSED]", bold: true, color: "2E7D32" })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Sign Up, Login, Profile, Logout with persistent session & protected routes." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "2. Real Teams Functionality" })] }),
                new TableCell({ children: [new Paragraph({ text: "Completed (100%)", children: [new TextRun({ text: " [PASSED]", bold: true, color: "2E7D32" })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Create team, short code join (TF-XXXX), team members collection & detail screen." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "3. Tasks Linked to Teams & Assignees" })] }),
                new TableCell({ children: [new Paragraph({ text: "Completed (100%)", children: [new TextRun({ text: " [PASSED]", bold: true, color: "2E7D32" })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Assign to team & member, team-aware task filtering, assignee badge displayed." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "4. Real-Time Chat Per Team" })] }),
                new TableCell({ children: [new Paragraph({ text: "Completed (100%)", children: [new TextRun({ text: " [PASSED]", bold: true, color: "2E7D32" })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Firestore onSnapshot listener, styled dual bubbles, timestamp, auto-scrolling." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "5. Firestore Security Rules" })] }),
                new TableCell({ children: [new Paragraph({ text: "Completed (100%)", children: [new TextRun({ text: " [PASSED]", bold: true, color: "2E7D32" })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Published rules requiring request.auth != null for all read/write operations." })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Bonus: ERD & Custom Theme" })] }),
                new TableCell({ children: [new Paragraph({ text: "Completed", children: [new TextRun({ text: " [BONUS]", bold: true, color: "D97706" })] })] }),
                new TableCell({ children: [new Paragraph({ text: "Curated Warm Orange & Cream Beige theme, complete README ERD diagram." })] }),
              ],
            }),
          ],
        }),
      ],
    },
  ],
});

function createPlaceholderBox(instructionText) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "FAF5EE" },
            borders: {
              top: { style: BorderStyle.DASHED, size: 2, color: "FF6B35" },
              bottom: { style: BorderStyle.DASHED, size: 2, color: "FF6B35" },
              left: { style: BorderStyle.DASHED, size: 2, color: "FF6B35" },
              right: { style: BorderStyle.DASHED, size: 2, color: "FF6B35" },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 400 },
                children: [
                  new TextRun({
                    text: instructionText,
                    bold: true,
                    color: "706155",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Generate docx file
const outputPath = path.join(__dirname, '..', 'StudentID_Exam2.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Successfully generated: ${outputPath}`);
});
